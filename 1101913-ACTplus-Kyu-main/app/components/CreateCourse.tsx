'use client'

import dynamic from "next/dynamic"
import { useState, FormEvent } from "react"
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

export default function CreateCourse() {
    const [open, setOpen] = useState(false)
    const [courseContent, setCourseContent] = useState('')
    const [modules, setModules] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const addModule = () => {
        setModules(prev => [
            ...prev,
            { id: Date.now(), title: '', summary: '', duration: '', order: prev.length + 1, contents: '' }
        ])
    }

    const handleModuleChange = (id: number, key: string, value: string) => {
        setModules(prev =>
            prev.map(m => (m.id === id ? { ...m, [key]: value } : m))
        )
    }

    const removeModule = (id: number) => {
        setModules(prev => prev.filter(m => m.id !== id))
    }

    const createCourse = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)

        const formdata = new FormData(e.currentTarget)
        formdata.append('contents', courseContent) // course Quill content
        formdata.append('modules', JSON.stringify(modules)) // modules with their Quill contents

        const res = await fetch('/api/v0/courses', {
            method: 'POST',
            body: formdata
        })
        const data = await res.json()
        console.log(data)
        setLoading(false)
    }

    // Quill toolbar with image upload handler
    const quillModules = {
        toolbar: {
            container: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: async function (this: any) {
                    const input = document.createElement('input')
                    input.setAttribute('type', 'file')
                    input.setAttribute('accept', 'image/*')
                    input.click()
                    input.onchange = async () => {
                        if (!input.files) return
                        const file = input.files[0]
                        const formData = new FormData()
                        formData.append('image', file)
                        const res = await fetch('/api/v1/courses/upload', { method: 'POST', body: formData })
                        const data = await res.json()
                        if (data.url) {
                            const range = this.quill.getSelection()
                            this.quill.insertEmbed(range.index, 'image', data.url)
                        }
                    }
                }
            }
        }
    }

    return (
        <div className="font-sans max-w-4xl mx-auto p-6 bg-white text-gray-900 min-h-screen">
            <button
                onClick={() => setOpen(!open)}
                className="mb-6 px-5 py-3 rounded-lg font-semibold bg-orange-500 text-white hover:bg-orange-600 transition"
            >
                {open ? 'Close Form' : 'Create Course'}
            </button>

            {open && (
                <form onSubmit={createCourse} className="flex flex-col gap-6">
                    <input
                        type="text"
                        name="title"
                        placeholder="Course Title"
                        required
                        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                        type="text"
                        name="description"
                        placeholder="Description"
                        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />

                    <select
                        name="category"
                        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                        <option value="web developer">Web Developer</option>
                        <option value="fullstack developer">Fullstack Developer</option>
                        <option value="game developer">Game Developer</option>
                        <option value="electrical engineer">Electrical Engineer</option>
                        <option value="software engineer">Software Engineer</option>
                    </select>

                    <select
                        name="level"
                        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>

                    <input
                        name="duration"
                        type="text"
                        placeholder="Duration (hours)"
                        required
                        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />

                    <select
                        name="instructor"
                        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                        <option value="1">John Doe</option>
                    </select>

                    <div className="border border-gray-300 rounded-md">
                        <ReactQuill
                            theme="snow"
                            value={courseContent}
                            onChange={setCourseContent}
                            modules={quillModules}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={addModule}
                        className="self-start bg-orange-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition"
                    >
                        + Add Module
                    </button>

                    {modules.map((m, i) => (
                        <div
                            key={m.id}
                            className="border border-gray-300 rounded-md bg-gray-50 p-4 space-y-3"
                        >
                            <h3 className="font-semibold text-lg text-gray-800">Module #{i + 1}</h3>
                            <input
                                type="text"
                                placeholder="Module Title"
                                value={m.title}
                                onChange={e => handleModuleChange(m.id, 'title', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                            <input
                                type="text"
                                placeholder="Summary"
                                value={m.summary}
                                onChange={e => handleModuleChange(m.id, 'summary', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                            <input
                                type="text"
                                placeholder="Duration"
                                value={m.duration}
                                onChange={e => handleModuleChange(m.id, 'duration', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />

                            <div className="border border-gray-300 rounded-md">
                                <ReactQuill
                                    theme="snow"
                                    value={m.contents}
                                    onChange={val => handleModuleChange(m.id, 'contents', val)}
                                    modules={quillModules}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => removeModule(m.id)}
                                className="text-orange-600 hover:underline font-semibold"
                            >
                                Remove Module
                            </button>
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-md font-semibold text-white transition
                            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}
                        `}
                    >
                        {loading ? 'Submitting…' : 'Submit Course'}
                    </button>
                </form>
            )}
        </div>
    )
}
