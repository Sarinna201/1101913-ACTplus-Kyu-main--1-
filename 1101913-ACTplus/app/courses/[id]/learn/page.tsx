// app/courses/[id]/learn/page.tsx
'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Module = {
    id: number;
    title: string;
    summary?: string;
    duration?: string;
    order: number;
};

type Question = {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
};

type ModuleContent = {
    preTestQuiz: Question[] | null;
    learningVideo: string | null;
    testQuiz: Question[] | null;
};

export default function CourseLearnPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();

    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [moduleContent, setModuleContent] = useState<ModuleContent | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingContent, setLoadingContent] = useState(false);

    // Learning state
    const [currentStep, setCurrentStep] = useState<'pretest' | 'video' | 'test' | 'complete'>('pretest');
    const [preTestAnswers, setPreTestAnswers] = useState<Record<string, number>>({});
    const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
    const [preTestScore, setPreTestScore] = useState<number | null>(null);
    const [testScore, setTestScore] = useState<number | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [moduleProgress, setModuleProgress] = useState<any>(null);

    useEffect(() => {
        if (!session?.user) {
            router.push('/login');
            return;
        }
        fetchCourseAndEnrollment();
    }, [id, session]);

    const fetchCourseAndEnrollment = async () => {
        try {
            setLoading(true);

            // Check enrollment
            const enrollRes = await fetch(`/api/v0/courses/${id}/enroll`);
            const enrollData = await enrollRes.json();

            if (!enrollData.success || !enrollData.enrolled) {
                alert('You need to enroll in this course first');
                router.push(`/courses/${id}`);
                return;
            }

            setIsEnrolled(true);

            // ✅ Fetch course with modules
            const courseRes = await fetch(`/api/v0/courses/${id}`);
            const courseData = await courseRes.json();

            if (courseData.success) {
                setCourse(courseData.course);

                // ✅ ใช้ modules จาก courseData.modules แทน courseData.course.modules
                const sortedModules = (courseData.modules || []).sort(
                    (a: Module, b: Module) => a.order - b.order
                );

                console.log('Fetched modules:', sortedModules); // ✅ Debug
                setModules(sortedModules);

                // Auto-select first module
                if (sortedModules.length > 0) {
                    loadModuleContent(sortedModules[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedModule) {
            loadModuleProgress(selectedModule.id);
        }
    }, [selectedModule]);

    const loadModuleProgress = async (moduleId: number) => {
        try {
            const res = await fetch(`/api/v0/modules/${moduleId}/progress`);
            const data = await res.json();

            if (data.success && data.progress) {
                setModuleProgress(data.progress);

                // Set current step based on progress
                if (data.progress.completed) {
                    setCurrentStep('complete');
                } else if (data.progress.test_score !== null) {
                    setCurrentStep('complete');
                } else if (data.progress.video_completed) {
                    setCurrentStep('test');
                } else if (data.progress.pre_test_score !== null) {
                    setCurrentStep('video');
                }
            } else {
                // Reset to pretest if no progress
                setCurrentStep('pretest');
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    };

    const saveProgress = async (updates: any) => {
        if (!selectedModule || !course) return;

        try {
            await fetch(`/api/v0/modules/${selectedModule.id}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: course.id,
                    ...updates
                })
            });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    const saveQuizAttempt = async (quizType: 'pre_test' | 'test', answers: any, score: number, total: number) => {
        if (!selectedModule) return;

        try {
            await fetch(`/api/v0/modules/${selectedModule.id}/quiz-attempt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizType,
                    answers,
                    score,
                    total,
                    passed: (score / total) >= 0.7
                })
            });
        } catch (error) {
            console.error('Error saving quiz attempt:', error);
        }
    };

    const loadModuleContent = async (module: Module) => {
        setSelectedModule(module);
        setLoadingContent(true);
        setCurrentStep('pretest');
        setPreTestAnswers({});
        setTestAnswers({});
        setPreTestScore(null);
        setTestScore(null);
        setShowResults(false);

        try {
            const res = await fetch(`/api/v0/modules/${module.id}/content`);
            const data = await res.json();

            if (data.success) {
                setModuleContent({
                    preTestQuiz: data.module.preTestQuiz,
                    learningVideo: data.module.learningVideo,
                    testQuiz: data.module.testQuiz
                });
            }
        } catch (error) {
            console.error('Error loading module content:', error);
        } finally {
            setLoadingContent(false);
        }
    };

    const handleSubmitPreTest = async () => {
        if (!moduleContent?.preTestQuiz) return;

        const correct = moduleContent.preTestQuiz.filter(
            q => preTestAnswers[q.id] === q.correctAnswer
        ).length;

        setPreTestScore(correct);

        await saveProgress({
            preTestScore: correct,
            preTestTotal: moduleContent.preTestQuiz.length
        });

        await saveQuizAttempt('pre_test', preTestAnswers, correct, moduleContent.preTestQuiz.length);

        alert(`Pre-test Score: ${correct}/${moduleContent.preTestQuiz.length}`);
        setCurrentStep('video');
    };

    const handleVideoComplete = async () => {
        await saveProgress({
            videoCompleted: true
        });
        setCurrentStep('test');
    };

    const handleSubmitTest = async () => {
        if (!moduleContent?.testQuiz) return;

        const correct = moduleContent.testQuiz.filter(
            q => testAnswers[q.id] === q.correctAnswer
        ).length;

        setTestScore(correct);
        setShowResults(true);

        const percentage = (correct / moduleContent.testQuiz.length) * 100;
        const passed = percentage >= 70;

        await saveProgress({
            testScore: correct,
            testTotal: moduleContent.testQuiz.length,
            completed: passed
        });

        await saveQuizAttempt('test', testAnswers, correct, moduleContent.testQuiz.length);

        if (passed) {
            setCurrentStep('complete');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading course...</p>
                </div>
            </div>
        );
    }

    // Check if course exists
    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
                    <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
                    <Link
                        href="/courses"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Browse Courses
                    </Link>
                </div>
            </div>
        );
    }

    // Check if modules exist
    if (modules.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Modules Available</h2>
                    <p className="text-gray-600 mb-6">This course doesn't have any modules yet.</p>
                    <Link
                        href={`/courses/${id}`}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Back to Course
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/courses/${id}`}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
                                {course.user && (
                                    <p className="text-sm text-gray-600">{course.user.username}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                                Progress: {selectedModule ? modules.findIndex(m => m.id === selectedModule.id) + 1 : 0}/{modules.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - Module List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
                            <h2 className="font-bold text-gray-900 mb-4">Course Modules</h2>
                            <div className="space-y-2">
                                {modules.map((module, index) => (
                                    <button
                                        key={module.id}
                                        onClick={() => loadModuleContent(module)}
                                        className={`w-full text-left p-3 rounded-lg transition ${selectedModule?.id === module.id
                                                ? 'bg-indigo-100 border-2 border-indigo-500'
                                                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${selectedModule?.id === module.id
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-300 text-gray-600'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-900 line-clamp-2">
                                                    {module.title}
                                                </p>
                                                {module.duration && (
                                                    <p className="text-xs text-gray-500 mt-1">{module.duration}</p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {loadingContent ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : selectedModule ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedModule.title}</h2>
                                {selectedModule.summary && (
                                    <p className="text-gray-600 mb-6">{selectedModule.summary}</p>
                                )}

                                {/* Progress Steps */}
                                <div className="flex items-center justify-between mb-8 pb-8 border-b">
                                    {['pretest', 'video', 'test', 'complete'].map((step, idx) => (
                                        <div key={step} className="flex items-center flex-1">
                                            <div className="flex flex-col items-center flex-1">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === step
                                                        ? 'bg-indigo-600 text-white'
                                                        : idx < ['pretest', 'video', 'test', 'complete'].indexOf(currentStep)
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-gray-200 text-gray-500'
                                                    }`}>
                                                    {idx < ['pretest', 'video', 'test', 'complete'].indexOf(currentStep) ? '✓' : idx + 1}
                                                </div>
                                                <span className="text-xs mt-2 font-medium capitalize">
                                                    {step === 'pretest' ? 'Pre-Test' : step}
                                                </span>
                                            </div>
                                            {idx < 3 && (
                                                <div className={`h-1 flex-1 ${idx < ['pretest', 'video', 'test', 'complete'].indexOf(currentStep)
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-200'
                                                    }`} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Content by Step */}
                                {currentStep === 'pretest' && moduleContent?.preTestQuiz && (
                                    <QuizSection
                                        title="Pre-Test Quiz"
                                        description="Test your knowledge before starting"
                                        questions={moduleContent.preTestQuiz}
                                        answers={preTestAnswers}
                                        onAnswerChange={setPreTestAnswers}
                                        onSubmit={handleSubmitPreTest}
                                        showResults={false}
                                        score={preTestScore}
                                    />
                                )}

                                {currentStep === 'video' && moduleContent?.learningVideo && (
                                    <VideoSection
                                        url={moduleContent.learningVideo}
                                        onComplete={handleVideoComplete}
                                    />
                                )}

                                {currentStep === 'test' && moduleContent?.testQuiz && (
                                    <QuizSection
                                        title="Test Quiz"
                                        description="Evaluate your learning"
                                        questions={moduleContent.testQuiz}
                                        answers={testAnswers}
                                        onAnswerChange={setTestAnswers}
                                        onSubmit={handleSubmitTest}
                                        showResults={showResults}
                                        score={testScore}
                                    />
                                )}

                                {currentStep === 'complete' && (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">🎉</div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            Module Completed!
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            Great job! Your score: {testScore}/{moduleContent?.testQuiz?.length || 0}
                                        </p>
                                        {modules.findIndex(m => m.id === selectedModule?.id) < modules.length - 1 ? (
                                            <button
                                                onClick={() => {
                                                    const currentIdx = modules.findIndex(m => m.id === selectedModule?.id);
                                                    const nextModule = modules[currentIdx + 1];
                                                    loadModuleContent(nextModule);
                                                }}
                                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                                            >
                                                Next Module →
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/courses/${id}`}
                                                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                                            >
                                                ✓ Course Completed
                                            </Link>
                                        )}
                                    </div>
                                )}

                                {/* Skip buttons for modules without content */}
                                {currentStep === 'pretest' && !moduleContent?.preTestQuiz && (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600 mb-4">No pre-test for this module</p>
                                        <button
                                            onClick={() => setCurrentStep('video')}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg"
                                        >
                                            Continue to Video
                                        </button>
                                    </div>
                                )}

                                {currentStep === 'video' && !moduleContent?.learningVideo && (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600 mb-4">No video for this module</p>
                                        <button
                                            onClick={() => setCurrentStep('test')}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg"
                                        >
                                            Continue to Test
                                        </button>
                                    </div>
                                )}

                                {currentStep === 'test' && !moduleContent?.testQuiz && (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600 mb-4">No test for this module</p>
                                        <button
                                            onClick={() => setCurrentStep('complete')}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg"
                                        >
                                            Complete Module
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <p className="text-gray-600">Select a module to start learning</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Quiz Section Component (เหมือนเดิม)
function QuizSection({
    title,
    description,
    questions,
    answers,
    onAnswerChange,
    onSubmit,
    showResults,
    score
}: {
    title: string;
    description: string;
    questions: Question[];
    answers: Record<string, number>;
    onAnswerChange: (answers: Record<string, number>) => void;
    onSubmit: () => void;
    showResults: boolean;
    score: number | null;
}) {
    return (
        <div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{description}</p>

            <div className="space-y-6">
                {questions.map((question, idx) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                        <p className="font-semibold mb-4">
                            {idx + 1}. {question.question}
                        </p>

                        <div className="space-y-2">
                            {question.options.map((option, optIdx) => (
                                <label
                                    key={optIdx}
                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${answers[question.id] === optIdx
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        } ${showResults && optIdx === question.correctAnswer
                                            ? 'border-green-500 bg-green-50'
                                            : ''
                                        } ${showResults && answers[question.id] === optIdx && optIdx !== question.correctAnswer
                                            ? 'border-red-500 bg-red-50'
                                            : ''
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        checked={answers[question.id] === optIdx}
                                        onChange={() => onAnswerChange({ ...answers, [question.id]: optIdx })}
                                        disabled={showResults}
                                        className="w-4 h-4"
                                    />
                                    <span>{option}</span>
                                    {showResults && optIdx === question.correctAnswer && (
                                        <span className="ml-auto text-green-600">✓</span>
                                    )}
                                </label>
                            ))}
                        </div>

                        {showResults && question.explanation && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-900">
                                    <strong>Explanation:</strong> {question.explanation}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {!showResults && (
                <button
                    onClick={onSubmit}
                    disabled={Object.keys(answers).length !== questions.length}
                    className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    Submit Quiz
                </button>
            )}

            {showResults && score !== null && (
                <div className={`mt-6 p-4 rounded-lg ${(score / questions.length) >= 0.7 ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                    <p className="text-center font-bold">
                        Your Score: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
                    </p>
                </div>
            )}
        </div>
    );
}

// Video Section Component (เหมือนเดิม)
function VideoSection({ url, onComplete }: { url: string; onComplete: () => void }) {
    const getEmbedUrl = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('youtube.com')
                ? url.split('v=')[1]?.split('&')[0]
                : url.split('youtu.be/')[1]?.split('?')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }

        if (url.includes('vimeo.com')) {
            const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
            return `https://player.vimeo.com/video/${videoId}`;
        }

        return url;
    };

    const embedUrl = getEmbedUrl(url);
    const isDirect = !url.includes('youtube.com') && !url.includes('vimeo.com') && !url.includes('youtu.be');

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Learning Video</h3>

            <div className="mb-6">
                {isDirect ? (
                    <video controls className="w-full rounded-lg">
                        <source src={embedUrl} />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                            src={embedUrl}
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}
            </div>

            <button
                onClick={onComplete}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
                Continue to Test →
            </button>
        </div>
    );
}