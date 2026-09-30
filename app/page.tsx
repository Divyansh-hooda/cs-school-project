'use client'

import { useMemo, useState } from 'react'
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

const initialTasks: Task[] = [
  { id: 1, title: 'Write homepage copy', project: 'Website Relaunch', status: 'todo', priority: 'High', due: 'Sep 26', overdue: true, tag: 'Content' },
  { id: 2, title: 'Audit existing site pages', project: 'Website Relaunch', status: 'todo', priority: 'Medium', due: 'Oct 5', tag: 'Research' },
  { id: 3, title: 'Set up analytics tracking', project: 'Website Relaunch', status: 'todo', priority: 'Low', due: 'Oct 14', tag: 'Development' },
  { id: 4, title: 'Design new navigation', project: 'Website Relaunch', status: 'progress', priority: 'High', due: 'Sep 28', overdue: true, tag: 'Design' },
  { id: 5, title: 'Migrate blog posts', project: 'Website Relaunch', status: 'progress', priority: 'Medium', due: 'Oct 8', tag: 'Development' },
  { id: 6, title: 'Define site goals', project: 'Website Relaunch', status: 'done', priority: 'Low', due: 'Sep 20', tag: 'Strategy', completed: 'Sep 20', completedTime: '4:15 PM' },
  { id: 7, title: 'Choose hosting provider', project: 'Website Relaunch', status: 'done', priority: 'Medium', due: 'Sep 22', tag: 'Infrastructure', completed: 'Sep 22', completedTime: '11:40 AM' },
  { id: 8, title: 'Create sitemap', project: 'Website Relaunch', status: 'done', priority: 'Low', due: 'Sep 24', tag: 'Research', completed: 'Sep 24', completedTime: '2:05 PM' },
]

const statusLabels: Record<Status, string> = { todo: 'To Do', progress: 'In Progress', done: 'Done' }

export default function Page() {
  const [projects, setProjects] = useState(initialProjects)
  const [activeProject, setActiveProject] = useState(initialProjects[0])
  const [tasks, setTasks] = useState(initialTasks)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState('All')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [dragged, setDragged] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('Medium')
  const [newDue, setNewDue] = useState('')
  const [showDue, setShowDue] = useState(false)

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    return task.project === activeProject &&
      (!query || task.title.toLowerCase().includes(query.toLowerCase())) &&
      (priority === 'All' || task.priority === priority) &&
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

  const addTask = (event: React.FormEvent) => {
    event.preventDefault()
    if (!newTitle.trim()) return
    setTasks((current) => [...current, { id: Date.now(), title: newTitle.trim(), project: activeProject, status: 'todo', priority: newPriority, due: newDue || 'Oct 21', tag: 'General' }])
    setNewTitle('')
    setNewDue('')
    setShowDue(false)
    setDialogOpen(false)
  }

  const projectTasks = tasks.filter((task) => task.project === activeProject)
  const overdueCount = projectTasks.filter((task) => task.overdue).length
  const doneCount = projectTasks.filter((task) => task.status === 'done').length

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#252a27] lg:flex">
      <aside className="flex w-full flex-col bg-[#1f2522] px-6 py-9 text-[#f6f4ef] lg:min-h-screen lg:w-[283px] lg:shrink-0">
        <div className="font-serif text-[32px] font-bold tracking-[-1.5px]">Tasklane</div>
        <div className="mt-9 text-[14px] uppercase tracking-[1.2px] text-[#b9c1bb]">Projects</div>
        <nav className="mt-3 space-y-2" aria-label="Projects">
          {projects.map((project) => <button key={project} onClick={() => setActiveProject(project)} className={`block w-full rounded-[10px] px-4 py-3 text-left text-[16px] transition ${activeProject === project ? 'bg-[#f5f2eb] font-semibold text-[#252a27]' : 'text-[#f0efeb] hover:bg-white/10'}`}>{project}</button>)}
        </nav>
        <button type="button" onClick={() => setProjectDialogOpen(true)} className="mt-8 rounded-[10px] border border-[#718077] px-4 py-3 text-[16px] text-[#f6f4ef] hover:bg-white/10 lg:mt-auto">+ New project</button>
      </aside>

      <section className="w-full max-w-[1380px] px-6 py-10 sm:px-10 lg:px-10 xl:px-10">
        <header className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
          <div><h1 className="font-serif text-[42px] font-bold leading-none tracking-[-1.5px] sm:text-[48px]">{activeProject}</h1><p className="mt-3 text-[17px] text-[#4d5752]">{projectTasks.length} tasks · {overdueCount} overdue · {doneCount} done</p></div>
          <button onClick={() => setDialogOpen(true)} className="inline-flex w-fit items-center gap-2 rounded-[9px] bg-[#216656] px-6 py-4 text-[16px] font-bold text-white hover:bg-[#194e42]"><Plus size={17} strokeWidth={3} /> Add task</button>
        </header>

        <div className="mt-8 flex flex-wrap gap-3">
          <label className="relative block w-full sm:w-[317px]"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#65706a]" /><input aria-label="Search tasks" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" className="h-[55px] w-full rounded-[10px] border border-[#d5cdbd] bg-white px-11 text-[16px] outline-none focus:border-[#216656]" /></label>
          <select aria-label="Priority" value={priority} onChange={(event) => setPriority(event.target.value)} className="priority-select h-[55px] rounded-[10px] border border-[#d5cdbd] bg-white px-5 pr-12 text-[16px] outline-none"><option>All</option><option>High</option><option>Medium</option><option>Low</option></select>
          <button onClick={() => setOverdueOnly(!overdueOnly)} className={`h-[55px] rounded-[10px] border px-5 text-[16px] font-medium ${overdueOnly ? 'border-[#a6440b] bg-[#f9ddcc] text-[#963d0c]' : 'border-[#d5cdbd] bg-[#f9ddcc] text-[#963d0c]'}`}>Overdue only</button>
        </div>

        <div className="mt-7 grid items-stretch gap-6 xl:grid-cols-3">
          {(['todo', 'progress', 'done'] as Status[]).map((status) => {
            const columnTasks = visibleTasks.filter((task) => task.status === status)
            return <section key={status} onDragOver={(event) => event.preventDefault()} onDrop={() => moveTask(status)} className="min-h-[530px] rounded-[17px] bg-[#ebe6da] p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-[16px] font-bold">{statusLabels[status]}</h2><span className="text-[16px] font-semibold text-[#4d5752]">{columnTasks.length}</span></div><div className="space-y-4">{columnTasks.map((task) => <article key={task.id} draggable onDragStart={() => setDragged(task.id)} className={`relative rounded-[15px] border border-[#ddd5c5] bg-white p-5 shadow-[0_1px_2px_rgba(30,30,20,.03)] ${status === 'done' ? 'bg-[#faf8f3]' : ''}`}>{status === 'done' && <button type="button" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)} className="absolute right-4 top-4 rounded-md p-1 text-[#7a817c] hover:bg-[#f1ddd3] hover:text-[#a0440c]"><X size={16} /></button>}<h3 className={`text-[18px] font-bold leading-tight ${status === 'done' ? 'text-[#5b625e] line-through pr-6' : ''}`}>{task.title}</h3><div className="mt-4 flex items-center gap-2 text-[14px]"><span className={`rounded-full px-3 py-1 font-semibold ${task.priority === 'High' ? 'bg-[#f9ddcc] text-[#a0440c]' : task.priority === 'Medium' ? 'bg-[#f5ebbd] text-[#77600b]' : 'bg-[#dcebe5] text-[#286052]'}`}>{task.priority}</span>{status === 'done' ? <span className="text-[#4d5752]">Completed {task.completed}<span className="mt-1 block text-[13px] text-[#7a817c]">{task.completedTime ?? 'Time not recorded'}</span></span> : <span className={task.overdue ? 'font-semibold text-[#a0440c]' : 'text-[#4d5752]'}>{task.overdue && 'Overdue · '}{!task.overdue && 'Due '}{task.due}</span>}</div><div className="mt-5 text-[14px] text-[#4d5752]"><span>{task.tag}</span></div></article>)}</div></section>
          })}
        </div>
      </section>

      {projectDialogOpen && <div className="fixed inset-0 z-20 grid place-items-center bg-[#1f2522]/45 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setProjectDialogOpen(false)}><form onSubmit={addProject} className="w-full max-w-[440px] rounded-2xl bg-[#fbfaf6] p-7 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-serif text-3xl font-bold">New project</h2><button type="button" aria-label="Close project dialog" onClick={() => setProjectDialogOpen(false)} className="rounded-full p-2 hover:bg-[#ebe6da]"><X size={20} /></button></div><label className="mt-6 block text-sm font-semibold">Project name<input autoFocus required value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 outline-none focus:border-[#216656]" placeholder="e.g. Product launch" /></label><button className="mt-6 w-full rounded-lg bg-[#216656] py-3 font-bold text-white hover:bg-[#194e42]">Create project</button></form></div>}

      {dialogOpen && <div className="fixed inset-0 z-10 grid place-items-center bg-[#1f2522]/45 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDialogOpen(false)}><form onSubmit={addTask} className="w-full max-w-[440px] rounded-2xl bg-[#fbfaf6] p-7 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-serif text-3xl font-bold">Add task</h2><button type="button" aria-label="Close dialog" onClick={() => setDialogOpen(false)} className="rounded-full p-2 hover:bg-[#ebe6da]"><X size={20} /></button></div><label className="mt-6 block text-sm font-semibold">Task name<input autoFocus required value={newTitle} onChange={(event) => setNewTitle(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 outline-none focus:border-[#216656]" placeholder="What needs to be done?" /></label><div className="mt-4 grid grid-cols-2 gap-3"><fieldset className="text-sm font-semibold"><legend>Priority</legend><div className="mt-2 flex items-center gap-3"><button type="button" aria-label="High priority" aria-pressed={newPriority === 'High'} onClick={() => setNewPriority('High')} className={`grid h-11 w-11 place-items-center rounded-full border-2 text-xs font-bold transition ${newPriority === 'High' ? 'border-[#a0440c] bg-[#f9ddcc] text-[#a0440c] ring-2 ring-[#f3c5ad]' : 'border-[#f9ddcc] bg-[#f9ddcc] text-[#a0440c]'}`}>H</button><button type="button" aria-label="Medium priority" aria-pressed={newPriority === 'Medium'} onClick={() => setNewPriority('Medium')} className={`grid h-11 w-11 place-items-center rounded-full border-2 text-xs font-bold transition ${newPriority === 'Medium' ? 'border-[#77600b] bg-[#f5ebbd] text-[#77600b] ring-2 ring-[#eee0a0]' : 'border-[#f5ebbd] bg-[#f5ebbd] text-[#77600b]'}`}>M</button><button type="button" aria-label="Low priority" aria-pressed={newPriority === 'Low'} onClick={() => setNewPriority('Low')} className={`grid h-11 w-11 place-items-center rounded-full border-2 text-xs font-bold transition ${newPriority === 'Low' ? 'border-[#286052] bg-[#dcebe5] text-[#286052] ring-2 ring-[#c4ded5]' : 'border-[#dcebe5] bg-[#dcebe5] text-[#286052]'}`}>L</button></div></fieldset></div>{showDue && <div className="mt-3 grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Date<input type="date" value={newDue.split('T')[0] ?? ''} onChange={(event) => setNewDue(`${event.target.value}T${newDue.split('T')[1] || '09:00'}`)} className="mt-2 h-11 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 font-normal outline-none focus:border-[#216656]" /></label><label className="text-sm font-semibold">Time<input type="time" value={newDue.split('T')[1] ?? ''} onChange={(event) => setNewDue(`${newDue.split('T')[0] || new Date().toISOString().split('T')[0]}T${event.target.value}`)} className="mt-2 h-11 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 font-normal outline-none focus:border-[#216656]" /></label></div>}<button className="mt-6 w-full rounded-lg bg-[#216656] py-3 font-bold text-white hover:bg-[#194e42]">{true ? 'Create task' : 'Add assignee'}</button></form></div>}
    </main>
  )
}
