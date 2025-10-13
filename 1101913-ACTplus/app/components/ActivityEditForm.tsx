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

type ActivitySkill = {
  id: number;
  code: string;
  name: string;
  description: string;
  color: string;
  points: number;
};

type SelectedSkill = {
  skillId: number;
  points: number;
};

type Activity = {
  id: number;
  title: string;
  detail: string;
  imageUrl: string;
  start_date: string;
  end_date: string | null;
  year: number;
  term: number;
  volunteerHours: number | null;
  authority: string;
  skills?: ActivitySkill[];
};

type ActivityEditFormProps = {
  activity: Activity;
  onCancel: () => void;
  onSave: (updatedActivity: Activity) => void;
};

export default function ActivityEditForm({
  activity,
  onCancel,
  onSave,
}: ActivityEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);

  const [formData, setFormData] = useState({
    title: activity.title,
    detail: activity.detail,
    dateStart: activity.start_date.slice(0, 16),
    dateEnd: activity.end_date ? activity.end_date.slice(0, 16) : "",
    year: activity.year,
    term: activity.term,
    volunteerHours: activity.volunteerHours || 0,
    authority: activity.authority,
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

  useEffect(() => {
    const fetchCurrentSkills = async () => {
      try {
        const response = await fetch(`/api/v0/activities/${activity.id}/skills`);
        if (response.ok) {
          const currentSkills = await response.json();
          const selectedSkillsData = currentSkills.map((skill: ActivitySkill) => ({
            skillId: skill.id,
            points: skill.points,
          }));
          setSelectedSkills(selectedSkillsData);
        }
      } catch (error) {
        console.error("Error fetching current skills:", error);
      }
    };

    if (activity.id) {
      fetchCurrentSkills();
    }
  }, [activity.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSkillToggle = (skillId: number) => {
    setSelectedSkills((prev) => {
      const existing = prev.find((s) => s.skillId === skillId);
      if (existing) {
        return prev.filter((s) => s.skillId !== skillId);
      } else {
        return [...prev, { skillId, points: 1 }];
      }
    });
  };

  const handleSkillPointsChange = (skillId: number, points: number) => {
    setSelectedSkills((prev) =>
      prev.map((s) =>
        s.skillId === skillId ? { ...s, points: Math.min(Math.max(points, 1), 10) } : s
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("detail", formData.detail);
      form.append("dateStart", formData.dateStart);
      if (formData.dateEnd) form.append("dateEnd", formData.dateEnd);
      form.append("year", formData.year.toString());
      form.append("term", formData.term.toString());
      form.append("volunteerHours", formData.volunteerHours.toString());
      form.append("authority", formData.authority);
      if (file) form.append("file", file);

      const activityResponse = await fetch(`/api/v0/activities/${activity.id}`, {
        method: "PUT",
        body: form,
      });

      if (!activityResponse.ok) {
        const errorData = await activityResponse.json();
        throw new Error(errorData.error || "Failed to update activity");
      }

      const updatedActivity = await activityResponse.json();

      const skillsResponse = await fetch(`/api/v0/activities/${activity.id}/skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skillIds: selectedSkills }),
      });

      if (!skillsResponse.ok) {
        console.warn("Failed to update skills");
      }

      onSave(updatedActivity);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white text-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-orange-600">Edit Activity</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close form"
              type="button"
            >
              &times;
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Information */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-6">
                Basic Information
              </h3>

              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label htmlFor="detail" className="block text-sm font-medium mb-1">
                  Detail <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="detail"
                  name="detail"
                  rows={4}
                  required
                  value={formData.detail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label htmlFor="file" className="block text-sm font-medium mb-1">
                  Replace Image
                </label>
                <input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {activity.imageUrl && !file && (
                  <div className="mt-3 flex flex-col items-start gap-2">
                    <img
                      src={activity.imageUrl}
                      alt="Current"
                      className="w-28 h-28 object-cover rounded-md border border-gray-200"
                    />
                    <p className="text-xs text-gray-500">Current image</p>
                  </div>
                )}
                {file && (
                  <p className="text-sm mt-2 text-gray-600">New: {file.name}</p>
                )}
              </div>
            </section>

            {/* Date & Time Information */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-6">
                Date & Time
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="dateStart" className="block text-sm font-medium mb-1">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="dateStart"
                    type="datetime-local"
                    name="dateStart"
                    required
                    value={formData.dateStart}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="dateEnd" className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <input
                    id="dateEnd"
                    type="datetime-local"
                    name="dateEnd"
                    value={formData.dateEnd}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </section>

            {/* Academic Information */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-6">
                Academic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium mb-1">
                    Year <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="year"
                    type="number"
                    name="year"
                    min={2020}
                    max={2030}
                    required
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="term" className="block text-sm font-medium mb-1">
                    Term <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="term"
                    name="term"
                    required
                    value={formData.term}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={1}>Term 1</option>
                    <option value={2}>Term 2</option>
                    <option value={3}>Term 3</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="volunteerHours"
                    className="block text-sm font-medium mb-1"
                  >
                    Volunteer Hours
                  </label>
                  <input
                    id="volunteerHours"
                    type="number"
                    name="volunteerHours"
                    min={0}
                    value={formData.volunteerHours}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="authority" className="block text-sm font-medium mb-1">
                  Authority <span className="text-red-600">*</span>
                </label>
                <input
                  id="authority"
                  type="text"
                  name="authority"
                  required
                  value={formData.authority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </section>

            {/* Skills Selection */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">
                Skills Development
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select skills that participants will develop through this activity
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill) => {
                  const isSelected = selectedSkills.some(
                    (s) => s.skillId === skill.id
                  );
                  const selectedSkill = selectedSkills.find(
                    (s) => s.skillId === skill.id
                  );

                  return (
                    <div
                      key={skill.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all select-none ${
                        isSelected
                          ? "border-orange-600 bg-orange-50"
                          : "border-gray-300 hover:border-orange-400"
                      }`}
                      onClick={() => handleSkillToggle(skill.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4
                            className="font-semibold text-orange-600"
                            title={skill.description}
                          >
                            {skill.code} - {skill.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            {skill.description}
                          </p>
                        </div>
                        {isSelected && (
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={selectedSkill?.points || 1}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              handleSkillPointsChange(
                                skill.id,
                                Number(e.target.value)
                              )
                            }
                            className="w-16 px-2 py-1 border border-orange-400 rounded-md text-center text-orange-600 font-semibold"
                            title="Points (1-10)"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedSkills.length > 0 && (
                <div className="mt-6 p-4 border-t border-gray-300 text-right font-semibold text-gray-700">
                  Total Skill Points:{" "}
                  {selectedSkills.reduce((acc, cur) => acc + cur.points, 0)}
                </div>
              )}
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-300">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-md bg-orange-600 text-white hover:bg-orange-700 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
