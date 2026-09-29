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
  assignee: string
  initials: string
  tag: string
  completed?: string
}

const initialProjects = ['Website Relaunch', 'Mobile App v2', 'Q4 Marketing']
const people = ['AK', 'RM', 'SP']

const initialTasks: Task[] = [
  { id: 1, title: 'Write homepage copy', project: 'Website Relaunch', status: 'todo', priority: 'High', due: 'Sep 26', overdue: true, assignee: 'Alex Kim', initials: 'AK', tag: 'Content' },
  { id: 2, title: 'Audit existing site pages', project: 'Website Relaunch', status: 'todo', priority: 'Medium', due: 'Oct 5', assignee: 'Riley Morgan', initials: 'RM', tag: 'Research' },
  { id: 3, title: 'Set up analytics tracking', project: 'Website Relaunch', status: 'todo', priority: 'Low', due: 'Oct 14', assignee: 'Sam Patel', initials: 'SP', tag: 'Development' },
  { id: 4, title: 'Design new navigation', project: 'Website Relaunch', status: 'progress', priority: 'High', due: 'Sep 28', overdue: true, assignee: 'Riley Morgan', initials: 'RM', tag: 'Design' },
  { id: 5, title: 'Migrate blog posts', project: 'Website Relaunch', status: 'progress', priority: 'Medium', due: 'Oct 8', assignee: 'Sam Patel', initials: 'SP', tag: 'Development' },
  { id: 6, title: 'Define site goals', project: 'Website Relaunch', status: 'done', priority: 'Low', due: 'Sep 20', assignee: 'Alex Kim', initials: 'AK', tag: 'Strategy', completed: 'Sep 20' },
  { id: 7, title: 'Choose hosting provider', project: 'Website Relaunch', status: 'done', priority: 'Medium', due: 'Sep 22', assignee: 'Sam Patel', initials: 'SP', tag: 'Infrastructure', completed: 'Sep 22' },
  { id: 8, title: 'Create sitemap', project: 'Website Relaunch', status: 'done', priority: 'Low', due: 'Sep 24', assignee: 'Riley Morgan', initials: 'RM', tag: 'Research', completed: 'Sep 24' },
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
  const [assignee, setAssignee] = useState('Anyone')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [dragged, setDragged] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('Medium')
  const [newAssignee, setNewAssignee] = useState('Alex Kim')
  const [newDue, setNewDue] = useState('')
  const [newAssigneeName, setNewAssigneeName] = useState('')
  const [assignees, setAssignees] = useState(['Alex Kim', 'Riley Morgan', 'Sam Patel'])
  const [showDue, setShowDue] = useState(false)
  const [showNewAssignee, setShowNewAssignee] = useState(false)

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    return task.project === activeProject &&
      (!query || task.title.toLowerCase().includes(query.toLowerCase())) &&
      (priority === 'All' || task.priority === priority) &&
      (assignee === 'Anyone' || task.assignee === assignee) &&
      (!overdueOnly || task.overdue)
  }), [tasks, activeProject, query, priority, assignee, overdueOnly])

  const moveTask = (status: Status) => {
    if (dragged === null) return
    setTasks((current) => current.map((task) => task.id === dragged ? { ...task, status, completed: status === 'done' ? 'Today' : undefined } : task))
    setDragged(null)
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

  const addNewAssignee = () => {
    const name = newAssigneeName.trim()
    if (!name || assignees.includes(name)) return
    setAssignees((current) => [...current, name])
    setNewAssignee(name)
    setNewAssigneeName('')
    setShowNewAssignee(false)
  }

  const addTask = (event: React.FormEvent) => {
    event.preventDefault()
    if (!newTitle.trim()) return
    const selectedAssignee = newAssigneeName.trim() || newAssignee
    const person = selectedAssignee.split(' ')[0]
    setTasks((current) => [...current, { id: Date.now(), title: newTitle.trim(), project: activeProject, status: 'todo', priority: newPriority, due: newDue || 'Oct 21', assignee: selectedAssignee, initials: person[0] + (selectedAssignee.split(' ')[1]?.[0] ?? ''), tag: 'General' }])
    setNewTitle('')
    setNewDue('')
    setNewAssigneeName('')
    setShowDue(false)
    setShowNewAssignee(false)
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
          <select aria-label="Assignee" value={assignee} onChange={(event) => setAssignee(event.target.value)} className="assignee-select h-[55px] rounded-[10px] border border-[#d5cdbd] bg-white px-5 pr-12 text-[16px] outline-none"><option>Anyone</option>{['Alex Kim', 'Riley Morgan', 'Sam Patel'].map((person) => <option key={person}>{person}</option>)}</select>
          <button onClick={() => setOverdueOnly(!overdueOnly)} className={`h-[55px] rounded-[10px] border px-5 text-[16px] font-medium ${overdueOnly ? 'border-[#a6440b] bg-[#f9ddcc] text-[#963d0c]' : 'border-[#d5cdbd] bg-[#f9ddcc] text-[#963d0c]'}`}>Overdue only</button>
        </div>

        <div className="mt-7 grid items-stretch gap-6 xl:grid-cols-3">
          {(['todo', 'progress', 'done'] as Status[]).map((status) => {
            const columnTasks = visibleTasks.filter((task) => task.status === status)
            return <section key={status} onDragOver={(event) => event.preventDefault()} onDrop={() => moveTask(status)} className="min-h-[530px] rounded-[17px] bg-[#ebe6da] p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-[16px] font-bold">{statusLabels[status]}</h2><span className="text-[16px] font-semibold text-[#4d5752]">{columnTasks.length}</span></div><div className="space-y-4">{columnTasks.map((task) => <article key={task.id} draggable onDragStart={() => setDragged(task.id)} className={`rounded-[15px] border border-[#ddd5c5] bg-white p-5 shadow-[0_1px_2px_rgba(30,30,20,.03)] ${status === 'done' ? 'bg-[#faf8f3]' : ''}`}><h3 className={`text-[18px] font-bold leading-tight ${status === 'done' ? 'text-[#5b625e] line-through' : ''}`}>{task.title}</h3><div className="mt-4 flex items-center gap-2 text-[14px]"><span className={`rounded-full px-3 py-1 font-semibold ${task.priority === 'High' ? 'bg-[#f9ddcc] text-[#a0440c]' : task.priority === 'Medium' ? 'bg-[#f5ebbd] text-[#77600b]' : 'bg-[#dcebe5] text-[#286052]'}`}>{task.priority}</span>{status === 'done' ? <span className="text-[#4d5752]">Completed {task.completed}</span> : <span className={task.overdue ? 'font-semibold text-[#a0440c]' : 'text-[#4d5752]'}>{task.overdue && 'Overdue · '}{!task.overdue && 'Due '}{task.due}</span>}</div><div className="mt-5 flex items-center justify-between text-[14px] text-[#4d5752]"><span>{task.tag}</span><span className={`grid h-[34px] w-[34px] place-items-center rounded-full text-[12px] font-bold text-white ${task.initials === 'RM' ? 'bg-[#a13f08]' : 'bg-[#216656]'}`}>{task.initials}</span></div></article>)}</div></section>
          })}
        </div>
      </section>

      {projectDialogOpen && <div className="fixed inset-0 z-20 grid place-items-center bg-[#1f2522]/45 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setProjectDialogOpen(false)}><form onSubmit={addProject} className="w-full max-w-[440px] rounded-2xl bg-[#fbfaf6] p-7 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-serif text-3xl font-bold">New project</h2><button type="button" aria-label="Close project dialog" onClick={() => setProjectDialogOpen(false)} className="rounded-full p-2 hover:bg-[#ebe6da]"><X size={20} /></button></div><label className="mt-6 block text-sm font-semibold">Project name<input autoFocus required value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 outline-none focus:border-[#216656]" placeholder="e.g. Product launch" /></label><button className="mt-6 w-full rounded-lg bg-[#216656] py-3 font-bold text-white hover:bg-[#194e42]">Create project</button></form></div>}

      {dialogOpen && <div className="fixed inset-0 z-10 grid place-items-center bg-[#1f2522]/45 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDialogOpen(false)}><form onSubmit={addTask} className="w-full max-w-[440px] rounded-2xl bg-[#fbfaf6] p-7 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-serif text-3xl font-bold">Add task</h2><button type="button" aria-label="Close dialog" onClick={() => setDialogOpen(false)} className="rounded-full p-2 hover:bg-[#ebe6da]"><X size={20} /></button></div><label className="mt-6 block text-sm font-semibold">Task name<input autoFocus required value={newTitle} onChange={(event) => setNewTitle(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 outline-none focus:border-[#216656]" placeholder="What needs to be done?" /></label><div className="mt-4 grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Priority<select value={newPriority} onChange={(event) => setNewPriority(event.target.value as Priority)} className="dialog-priority-select mt-2 h-11 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 pr-10 font-normal"><option>High</option><option>Medium</option><option>Low</option></select></label><label className="text-sm font-semibold">Assignee<select value={newAssignee} onChange={(event) => setNewAssignee(event.target.value)} className="dialog-assignee-select mt-2 h-11 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 pr-10 font-normal">{assignees.map((assignee) => <option key={assignee}>{assignee}</option>)}</select></label></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setShowDue((visible) => !visible)} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${showDue ? 'border-[#216656] bg-[#e1eee9] text-[#216656]' : 'border-[#d5cdbd] text-[#4d5752] hover:bg-[#ebe6da]'}`}>{showDue ? 'Remove date/time limit' : '+ Add date or time limit'}</button><button type="button" onClick={() => setShowNewAssignee((visible) => !visible)} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${showNewAssignee ? 'border-[#216656] bg-[#e1eee9] text-[#216656]' : 'border-[#d5cdbd] text-[#4d5752] hover:bg-[#ebe6da]'}`}>{showNewAssignee ? 'Remove new assignee' : '+ Add new assignee'}</button></div>{showDue && <label className="mt-3 block text-sm font-semibold">Due date/time<input type="datetime-local" value={newDue} onChange={(event) => setNewDue(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#d5cdbd] bg-white px-3 font-normal outline-none focus:border-[#216656]" /></label>}{showNewAssignee && <label className="mt-3 block text-sm font-semibold">New assignee<div className="mt-2 flex h-11 overflow-hidden rounded-lg border border-[#d5cdbd] bg-white focus-within:border-[#216656]"><input value={newAssigneeName} onChange={(event) => setNewAssigneeName(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 font-normal outline-none" placeholder="Full name" /><button type="button" onClick={addNewAssignee} className="border-l border-[#d5cdbd] bg-[#e1eee9] px-3 text-sm font-bold text-[#216656] hover:bg-[#cfe3db]">Add</button></div></label>}<button className="mt-6 w-full rounded-lg bg-[#216656] py-3 font-bold text-white hover:bg-[#194e42]">Create task</button></form></div>}
    </main>
  )
}
