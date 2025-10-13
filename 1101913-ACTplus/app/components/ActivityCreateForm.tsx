"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Skill = {
  id: number;
  code: string;
  name: string;
  description: string;
  color: string;
};

type SelectedSkill = {
  skillId: number;
  points: number;
};

type ActivityCreateFormProps = {
  onCancel: () => void;
  onSuccess: (activityId: number) => void;
};

export default function ActivityCreateForm({ onCancel, onSuccess }: ActivityCreateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    detail: "",
    dateStart: "",
    dateEnd: "",
    year: new Date().getFullYear(),
    term: 1,
    volunteerHours: 0,
    authority: ""
  });

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch("/api/v0/skills");
        if (response.ok) {
          const skillsData = await response.json();
          setSkills(skillsData);
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };
    fetchSkills();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSkillToggle = (skillId: number) => {
    setSelectedSkills(prev => {
      const existing = prev.find(s => s.skillId === skillId);
      if (existing) return prev.filter(s => s.skillId !== skillId);
      else return [...prev, { skillId, points: 1 }];
    });
  };

  const handleSkillPointsChange = (skillId: number, points: number) => {
    setSelectedSkills(prev =>
      prev.map(s =>
        s.skillId === skillId ? { ...s, points: Math.max(1, points) } : s
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('detail', formData.detail);
      form.append('dateStart', formData.dateStart);
      if (formData.dateEnd) form.append('dateEnd', formData.dateEnd);
      form.append('year', formData.year.toString());
      form.append('term', formData.term.toString());
      form.append('volunteerHours', formData.volunteerHours.toString());
      form.append('authority', formData.authority);
      if (file) form.append('file', file);

      const activityResponse = await fetch("/api/v0/activities", {
        method: 'POST',
        body: form
      });

      if (!activityResponse.ok) {
        const errorData = await activityResponse.json();
        throw new Error(errorData.error || 'Failed to create activity');
      }

      const newActivity = await activityResponse.json();

      if (selectedSkills.length > 0) {
        await fetch(`/api/v0/activities/${newActivity.id}/skills`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillIds: selectedSkills })
        });
      }

      onSuccess(newActivity.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-orange-500">Create New Activity</h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-red-500 text-xl">×</button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-600 text-white rounded">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Basic Information */}
            <section>
              <h3 className="text-lg font-semibold text-orange-400 mb-3">Basic Information</h3>
              <div className="grid gap-4">
                <label className="text-sm">Title *</label>
                <input
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="bg-gray-100 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <label className="text-sm">Detail *</label>
                <textarea
                  name="detail"
                  rows={3}
                  required
                  value={formData.detail}
                  onChange={handleInputChange}
                  className="bg-gray-100 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <label className="text-sm">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-gray-900"
                />
              </div>
            </section>

            {/* Section: Date & Time */}
            <section>
              <h3 className="text-lg font-semibold text-orange-400 mb-3">Date & Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Start Date *</label>
                  <input
                    type="datetime-local"
                    name="dateStart"
                    required
                    value={formData.dateStart}
                    onChange={handleInputChange}
                    className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm">End Date</label>
                  <input
                    type="datetime-local"
                    name="dateEnd"
                    value={formData.dateEnd}
                    onChange={handleInputChange}
                    className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </section>

            {/* Section: Academic */}
            <section>
              <h3 className="text-lg font-semibold text-orange-400 mb-3">Academic Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm">Year *</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="text-sm">Term *</label>
                  <select
                    name="term"
                    value={formData.term}
                    onChange={handleInputChange}
                    className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm">Volunteer Hours</label>
                  <input
                    type="number"
                    name="volunteerHours"
                    value={formData.volunteerHours}
                    onChange={handleInputChange}
className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm">Authority *</label>
                <input
                  type="text"
                  name="authority"
                  required
                  value={formData.authority}
                  onChange={handleInputChange}
                  className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </section>

            {/* Section: Skills */}
            <section>
              <h3 className="text-lg font-semibold text-orange-500 mb-3">Skills Development</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {skills.map(skill => {
                  const isSelected = selectedSkills.some(s => s.skillId === skill.id);
                  const selectedSkill = selectedSkills.find(s => s.skillId === skill.id);

                  return (
                    <div
                      key={skill.id}
                      className={`p-4 rounded-lg border cursor-pointer transition ${
                        isSelected
                          ? 'border-orange-500 bg-orange-100'
                          : 'border-gray-300 hover:border-orange-400'
                      }`}
                      onClick={() => handleSkillToggle(skill.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-semibold text-gray-700">{skill.code}</span>
                          <h4 className="text-base text-black">{skill.name}</h4>
                          <p className="text-sm text-gray-500">{skill.description}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSkillToggle(skill.id)}
                          className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                          onClick={e => e.stopPropagation()} // ป้องกัน toggle ซ้ำตอนคลิก checkbox
                        />
                      </div>
                      {isSelected && (
                        <div className="mt-2">
                          <label className="text-sm text-orange-600 font-medium">Points</label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={selectedSkill?.points || 1}
                            onChange={(e) => handleSkillPointsChange(skill.id, parseInt(e.target.value))}
                            className="w-20 px-2 py-1 rounded border border-orange-400 mt-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-300">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Activity"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
