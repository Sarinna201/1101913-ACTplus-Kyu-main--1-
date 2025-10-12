// components\courses\CoursesList.tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

// Define User type (adjust fields as needed)
interface User {
    id: number;
    username: string;
    // add other fields if necessary
}

// Define Courses type (adjust fields as needed)
interface Courses {
    id: number;
    title: string;
    description: string;
    rating: number;
    level: string;
    instructor: number;
    // add other fields if necessary
}

export default function CoursesList() {
    const [courses, setCourses] = useState<Courses[]>([]) // []
    const [users, setUsers] = useState<User[]>([]) // []

    const [filtered, setFiltered] = useState<Courses[]>()

    const [currentPage, setCurrentPage] = useState(1)

    const itemsPerPage = 12
    const allPage = Math.ceil(courses?.length / 12)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = courses.slice(startIndex, endIndex)

    useEffect(() => {
        // Promise.all([
        //     fetch('/api/v1/courses')
        //         .then(res => res.json())
        //         .then(data => setCourses(data.courses || [])),
        //     fetch('/api/v1/users')
        //         .then(res => res.json())
        //         .then(data => {
        //             setUsers(data.users || [])
        //         })
        // ])
        fetch('/api/v1/courses')
            .then(res => res.json())
            .then(data => setCourses(data.courses || [])),
        fetch('/api/v1/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data.users || [])
            })

    }, [])

    if (!courses.length || !users.length) {
        return <div>Loading...</div>;
    }

    const changePage = (index: number) => {
        setCurrentPage(index)
    }

    return (
        <div>
            <div className="flex gap-3 py-3">
                <input type="text" placeholder="title and description" className="border p-1" />
                <select name="level" id="level" className="border p-1">
                    <option value="All">all</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
            </div>
            <div className="grid grid-rows-4 grid-cols-3 gap-3">
                {
                    currentItems.map((c) =>
                        <div key={c.id} className="flex flex-col border p-3 min-w-[256px] max-w-[364px]">
                            {/* add image cover? */}
                            <div>
                                <p>{c.title}</p>
                                <p>{c.description}</p>
                            </div>
                            <div>
                                <p>{c.rating}</p>
                                <p>{c.level}</p>
                                <p>{users.find(v => Number(c.instructor) == v.id)?.username || 'unknow'}</p>
                                <Link href={`/courses/${c.id}`}>view more</Link>
                            </div>
                        </div>
                    )
                }
            </div>
            <div>
                {/* pagination btn */}
                {(
                    <div className="py-3">
                        {(allPage > 1) && Array.from({ length: allPage }, (_, i) => {
                            const ind = i + 1
                            return (<button
                                onClick={() => { changePage(ind) }}
                                className={`px-3 py-1 border ${currentPage == ind ? 'text-blue-500' : 'text-black'}`}
                            >
                                {ind}
                            </button>)
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}