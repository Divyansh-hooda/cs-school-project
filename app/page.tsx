'use client'

import useSWR from 'swr'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'

type Status = 'todo' | 'progress' | 'done'
type Priority = 'High' | 'Medium' | 'Low'

type Task = {
  id: number
  title: string
  project: string
  status: Status
  priority: Priority
  due: string
  overdue?: boolean
  tag: string
  completed?: string
  completedTime?: string
}

const initialProjects = ['Website Relaunch', 'Mobile App v2', 'Q4 Marketing']
const people = ['AK', 'RM', 'SP']

const initialTasks: Task[] = []

const statusLabels: Record<Status, string> = { todo: 'To Do', progress: 'In Progress', done: 'Done' }

const fetcher = (url: string) => fetch(url).then((response) => response.json())

export default function Page() {
  const { data: savedBoard, mutate } = useSWR('/api/board', fetcher)
  const [projects, setProjects] = useState(initialProjects)
  const [activeProject, setActiveProject] = useState(initialProjects[0])
  const [tasks, setTasks] = useState(initialTasks)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState('Priority')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [dragged, setDragged] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('Medium')
  const [newCategory, setNewCategory] = useState('General')
  const [categories, setCategories] = useState(['General', 'Content', 'Research', 'Development', 'Strategy'])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [dialogMode, setDialogMode] = useState<'task' | 'category' | 'remove-category'>('task')
  const [newDue, setNewDue] = useState('')
  const [showDue, setShowDue] = useState(false)
  const hydrated = useRef(false)

  useEffect(() => {
    if (savedBoard === undefined || hydrated.current) return
    const board = savedBoard ?? { projects: initialProjects, activeProject: initialProjects[0], tasks: initialTasks, categories: ['General', 'Content', 'Research', 'Development', 'Strategy'] }
    setProjects(board.projects)
    setActiveProject(board.activeProject)
    setTasks(board.tasks)
    setCategories(board.categories)
    hydrated.current = true
    if (!savedBoard) saveBoard(board)
  }, [savedBoard])

  const saveBoard = (next: { projects: string[]; activeProject: string; tasks: Task[]; categories: string[] }) => {
    void fetch('/api/board', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).then(() => mutate(next, false))
  }

  useEffect(() => {
    if (!hydrated.current) return
    saveBoard({ projects, activeProject, tasks, categories })
  }, [projects, activeProject, tasks, categories])

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    return task.project === activeProject &&
      (!query || task.title.toLowerCase().includes(query.toLowerCase())) &&
      (priority === 'Priority' || task.priority === priority) &&
      (!overdueOnly || task.overdue)
  }), [tasks, activeProject, query, priority, overdueOnly])

  const moveTask = (status: Status) => {
    if (dragged === null) return
    setTasks((current) => current.map((task) => task.id === dragged ? { ...task, status, completed: status === 'done' ? 'Today' : undefined, completedTime: status === 'done' ? new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : undefined } : task))
    setDragged(null)
  }

  const deleteTask = (taskId: number) => {
    setTasks((current) => current.filter((task) => task.id !== taskId))
  }

  const addProject = (event: React.FormEvent) => {
    event.preventDefault()
    const name = newProjectName.trim()
    if (!name || projects.includes(name)) return
    setProjects((current) => [...current, name])
    setActiveProject(name)
    setNewProjectName('')
    setProjectDialogOpen(false)
  }

  const addCategory = (event: React.FormEvent) => {
    event.preventDefault()
    const name = newCategoryName.trim()
    if (!name || categories.includes(name)) return
    setCategories((current) => [...current, name])
    setNewCategory(name)
    setNewCategoryName('')
    setDialogMode('task')
  }

  const removeCategory = (event: React.FormEvent) => {
    event.preventDefault()
    if (categories.length <= 1) return
    const category = newCategory || categories[0]
    setCategories((current) => current.filter((item) => item !== category))
    setNewCategory('General')
    setDialogMode('task')
  }

  const addTask = (event: React.FormEvent) => {
    event.preventDefault()
    if (!newTitle.trim()) return
    setTasks((current) => [...current, { id: Date.now(), title: newTitle.trim(), project: activeProject, status: 'todo', priority: newPriority, due: newDue || 'Oct 21', tag: newCategory }])
    setNewTitle('')
    setNewDue('')
    setShowDue(false)
    setDialogOpen(false)
  }

  const projectTasks = tasks.filter((task) => task.project === activeProject)
  const overdueCount = projectTasks.filter((task) => task.overdue).length
  const doneCount = projectTasks.filter((task) => task.status === 'done').length

  return (
    <main className="flex min-h-screen justify-center bg-[#f5f2eb] text-[#252a27]">
      <section className="mx-auto flex w-full max-w-[1380px] flex-col items-stretch px-6 py-10 text-left sm:px-10 lg:px-10 xl:px-10">
        <header className="flex w-full flex-row items-start justify-between gap-3 text-left sm:items-center">
          <div><h1 className="font-serif text-[42px] font-bold leading-none tracking-[-1.5px] sm:text-[48px]">TASKLANE</h1><p className="mt-3 flex flex-wrap items-center gap-2 text-[17px] font-semibold"><span className="text-[#2563eb]">{projectTasks.length} tasks</span><span aria-hidden="true">·</span><span className="text-[#dc2626]">{overdueCount} overdue tasks</span><span aria-hidden="true">·</span><span className="text-[#ca8a04]">{projectTasks.length - doneCount} pending</span><span aria-hidden="true">·</span><span className="text-[#16a34a]">{doneCount} done</span></p></div>
          <button onClick={() => setDialogOpen(true)} className="inline-flex w-fit items-center gap-2 rounded-[9px] bg-[#216656] px-6 py-4 text-[16px] font-bold text-white hover:bg-[#194e42]"><Plus size={17} strokeWidth={3} /> Add task</button>
        </header>

        <div className="mt-8 flex w-full flex-wrap justify-start gap-3">
          <label className="relative block w-full sm:w-[317px]"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#65706a]" /><input aria-label="Search tasks" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" className="h-[55px] w-full rounded-[10px] border border-[#d5cdbd] bg-white px-11 text-[16px] outline-none focus:border-[#216656]" /></label>
          <select aria-label="Priority" value={priority} onChange={(event) => setPriority(event.target.value)} className="priority-select h-[55px] rounded-[10px] border border-[#d5cdbd] bg-white px-5 pr-12 text-[16px] outline-none"><option>Priority</option><option>High</option><option>Medium</option><option>Low</option></select>
          <button onClick={() => setOverdueOnly(!overdueOnly)} className={`h-[55px] rounded-[10px] border px-5 text-[16px] font-medium ${overdueOnly ? 'border-[#a6440b] bg-[#f9ddcc] text-[#963d0c]' : 'border-[#d5cdbd] bg-[#f9ddcc] text-[#963d0c]'}`}>Overdue tasks</button>
        </div>

        <div className="mt-7 grid w-full min-w-0 items-stretch justify-start justify-items-stretch gap-6 xl:grid-cols-3">
          {(['todo', 'progress', 'done'] as Status[]).map((status) => {
            const columnTasks = visibleTasks.filter((task) => task.status === status)
            return <section key={status} onDragOver={(event) => event.preventDefault()} onDrop={() => moveTask(status)} className="min-h-[530px] rounded-[17px] bg-[#ebe6da] p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-[16px] font-bold">{statusLabels[status]}</h2><span className="text-[16px] font-semibold text-[#4d5752]">{columnTasks.length}</span></div><div className="space-y-4">{columnTasks.map((task) => <article key={task.id} draggable onDragStart={() => setDragged(task.id)} className={`relative rounded-[15px] border border-[#ddd5c5] bg-white p-5 shadow-[0_1px_2px_rgba(30,30,20,.03)] ${status === 'done' ? 'bg-[#faf8f3]' : ''}`}>{status === 'done' && <button type="button" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)} className="absolute right-4 top-4 rounded-md p-1 text-[#7a817c] hover:bg-[#f1ddd3] hover:text-[#a0440c]"><X size={16} /></button>}<h3 className={`text-[18px] font-bold leading-tight ${status === 'done' ? 'text-[#5b625e] line-through pr-6' : ''}`}>{task.title}</h3><div className="mt-4 flex items-center gap-2 text-[14px]"><span className={`rounded-full px-3 py-1 font-semibold ${task.priority === 'High' ? 'bg-[#f9ddcc] text-[#a0440c]' : task.priority === 'Medium' ? 'bg-[#f5ebbd] text-[#77600b]' : 'bg-[#dcebe5] text-[#286052]'}`}>{task.priority}</span>{status === 'done' ? <span className="text-[#4d5752]">Completed {task.completed}</span> : <span className={task.overdue ? 'font-semibold text-[#a0440c]' : 'text-[#4d5752]'}>{task.overdue && 'Overdue · '}{!task.overdue && 'Due '}{task.due}</span>}</div><div className="mt-5 text-[14px] text-[#4d5752]"><span>{task.tag}</span></div></article>)}</div></section>
          })}
        </div>
      </section>

      {projectDialogOpen && <div className="fixed inset-0 z-20 grid place-items-center bg-[#1f2522]/45 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setProjectDialogOpen(false)}><form onSubmit={addProject} className="w-full max-w-[440px] rounded-2xl bg-[#fbfaf6] p-7 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-serif text-3xl font-bold">New project</h2><button type="button" aria-label="Close project dialog" onClick={() => setProjectDialogOpen(false)} className="rounded-full p-2 hover:bg-[#ebe6da]"><X size={20} /></button></div><label className="mt-6 block text-sm font-semibold">Project name<input autoFocus required value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 outline-none focus:border-[#216656]" placeholder="e.g. Product launch" /></label><button className="mt-6 w-full rounded-lg bg-[#216656] py-3 font-bold text-white hover:bg-[#194e42]">Create project</button></form></div>}

      {dialogOpen && <div className="fixed inset-0 z-10 grid place-items-center bg-[#1f2522]/45 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDialogOpen(false)}><form onSubmit={dialogMode === 'category' ? addCategory : dialogMode === 'remove-category' ? removeCategory : addTask} className={`task-dialog w-full max-w-[500px] rounded-2xl bg-[#fbfaf6] p-7 shadow-2xl ${dialogMode === 'category' ? 'dialog-category' : dialogMode === 'remove-category' ? 'dialog-remove-category' : 'dialog-task'}`}><div className="flex items-center justify-between"><h2 className="font-serif text-3xl font-bold">{dialogMode === 'category' ? 'Add new category' : 'Add task'}</h2><button type="button" aria-label="Close dialog" onClick={() => setDialogOpen(false)} className="rounded-full p-2 hover:bg-[#ebe6da]"><X size={20} /></button></div><div className="dialog-tabs mt-6 grid grid-cols-3 rounded-lg bg-[#ebe6da] p-1"><button type="button" onClick={() => setDialogMode('task')} className={`rounded-md px-3 py-2 text-sm font-semibold ${dialogMode === 'task' ? 'bg-white text-[#216656] shadow-sm' : 'text-[#4d5752]'}`}>Add task</button><button type="button" onClick={() => setDialogMode('category')} className={`rounded-md px-3 py-2 text-sm font-semibold ${dialogMode === 'category' ? 'bg-white text-[#216656] shadow-sm' : 'text-[#4d5752]'}`}>Add category</button><button type="button" onClick={() => setDialogMode('remove-category')} className={`rounded-md px-3 py-2 text-sm font-semibold ${dialogMode === 'remove-category' ? 'bg-white text-[#a0440c] shadow-sm' : 'text-[#4d5752]'}`}>Remove category</button></div><label className="remove-category-form mt-6 block text-sm font-semibold">Category to remove<select value={newCategory} onChange={(event) => setNewCategory(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 outline-none focus:border-[#a0440c]">{categories.map((category) => <option key={category}>{category}</option>)}</select></label><button type="submit" className="remove-category-form mt-6 w-full rounded-lg bg-[#b90000] py-3 font-bold text-white hover:bg-[#a30000]">Remove category</button><label className="category-form mt-6 block text-sm font-semibold">Category name<input value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 outline-none focus:border-[#216656]" placeholder="e.g. Marketing" /></label><button type="submit" className="category-form mt-6 w-full rounded-lg bg-[#216656] py-3 font-bold text-white hover:bg-[#194e42]">Create category</button><label className="mt-6 block text-sm font-semibold">Task name<input autoFocus required={dialogMode === 'task'} value={newTitle} onChange={(event) => setNewTitle(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 outline-none focus:border-[#216656]" placeholder="What needs to be done?" /></label><div className="mt-4 grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Priority<select value={newPriority} onChange={(event) => setNewPriority(event.target.value as Priority)} className="priority-select mt-2 h-11 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 pr-10 font-normal"><option>High</option><option>Medium</option><option>Low</option></select></label><label className="text-sm font-semibold">Due date<input type="date" aria-label="Select due date" value={newDue.split('T')[0] ?? ''} onChange={(event) => setNewDue(`${event.target.value}T09:00`)} className="mt-2 h-11 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 text-sm font-semibold text-[#4d5752] outline-none focus:border-[#216656]" /></label><div className="col-span-2 text-sm font-semibold"><span>Category</span><div className="category-select mt-2 flex min-h-11 w-full items-center rounded-lg border border-[#d5cdbd] bg-white px-3"><select aria-label="Category" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none">{categories.map((category) => <option key={category}>{category}</option>)}</select></div></div></div>{showDue && <div className="hidden"><label className="text-sm font-semibold">Date<input type="date" value={newDue.split('T')[0] ?? ''} onChange={(event) => setNewDue(`${event.target.value}T${newDue.split('T')[1] || '09:00'}`)} className="mt-2 h-11 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 font-normal outline-none focus:border-[#216656]" /></label><label className="text-sm font-semibold">Time<input type="time" value={newDue.split('T')[1] ?? ''} onChange={(event) => setNewDue(`${newDue.split('T')[0] || new Date().toISOString().split('T')[0]}T${event.target.value}`)} className="mt-2 h-11 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 font-normal outline-none focus:border-[#216656]" /></label></div>}<button className="mt-6 w-full rounded-lg bg-[#216656] py-3 font-bold text-white hover:bg-[#194e42]">{true ? 'Create task' : 'Add assignee'}</button></form></div>}
    </main>
  )
}
