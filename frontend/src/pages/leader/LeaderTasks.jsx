import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Clock, AlignLeft, MessageSquare, Plus, ShieldCheck, Edit3, Check, Loader2, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getMyTasks, updateTaskStatus, deleteTask, addComment, updateTask } from "../../api/taskApi"; 
import { getMyTeam } from "../../api/userApi";
import AssignTaskModal from "../../components/Leader/AssignTaskModal"; 

export default function LeaderTasks() {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editing States
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchData();
    const handleTaskCreated = () => fetchData();
    window.addEventListener("taskCreated", handleTaskCreated);
    return () => window.removeEventListener("taskCreated", handleTaskCreated);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const tasksResponse = await getMyTasks();
      const transformedTasks = (tasksResponse.tasks || []).map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: capitalizeStatus(task.status),
        priority: task.priority,
        domain: task.departments?.[0] || task.project?.domain || 'General',
        due: new Date(task.dueDate).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        }),
        dueDate: task.dueDate,
        assignees: task.assignedTo?.map(user => user.name || user.email) || [],
        assigneeIds: task.assignedTo?.map(user => user._id) || [],
        comments: task.comments || [],
        projectName: task.project?.name || 'No Project',
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        rawStatus: task.status
      }));

      setAllTasks(transformedTasks);
      const teamResponse = await getMyTeam();
      setTeamMembers(teamResponse.teamMembers || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const capitalizeStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'blocked': 'Blocked'
    };
    return statusMap[status] || status;
  };

  const uncapitalizeStatus = (status) => {
    const statusMap = {
      'Pending': 'pending',
      'In Progress': 'in-progress',
      'Completed': 'completed',
      'Blocked': 'blocked'
    };
    return statusMap[status] || status.toLowerCase();
  };

  const startEditing = () => {
    setEditData({
      title: selectedTask.title,
      description: selectedTask.description,
      dueDate: selectedTask.dueDate?.split('T')[0]
    });
    setIsEditingTask(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateTask(selectedTask.id, editData);
      toast.success("Task updated successfully");
      setIsEditingTask(false);
      fetchData();
      setSelectedTask(null); 
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const rawStatus = uncapitalizeStatus(newStatus);
      
      // Real-time UI Update
      setAllTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus, rawStatus: rawStatus } : t
      ));
      
      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: newStatus, rawStatus: rawStatus }));
      }

      await updateTaskStatus(taskId, rawStatus);
      toast.success(`Moved to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update task status');
      await fetchData();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      setAllTasks(prev => prev.filter(t => t.id !== taskId));
      setSelectedTask(null);
      await deleteTask(taskId);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
      await fetchData();
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedTask) return;
    try {
      await addComment(selectedTask.id, commentText);
      toast.success('Comment added');
      setCommentText("");
      await fetchData();
      const updatedTask = allTasks.find(t => t.id === selectedTask.id);
      if (updatedTask) setSelectedTask(updatedTask);
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleTaskCreated = () => {
    setIsAssignModalOpen(false);
    fetchData();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F6F6F8] font-sans">
      <div className="flex-1 p-6 lg:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#0D2426]">Task Management</h1>
            <p className="text-xs text-[#6D8B8C]">Manage operational workflows and team assignments</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest">Active Tasks</p>
              <p className="text-lg font-semibold text-[#235857]">{allTasks.length}</p>
            </div>
            <div className="text-center border-l border-[#D3D9D4] pl-6">
              <p className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest">System Status</p>
              <p className="text-lg font-semibold text-[#235857] flex items-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Online'}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#235857] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {["Pending", "In Progress", "Completed"].map((col) => (
              <div key={col} className="flex flex-col gap-5 bg-[#F0F2F0]/30 p-5 rounded-[2.5rem] border border-[#D3D9D4]/40">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col === 'Pending' ? 'bg-amber-400' : col === 'In Progress' ? 'bg-[#235857]' : 'bg-emerald-500'}`} />
                    <h2 className="text-sm font-semibold text-[#0D2426]">{col}</h2>
                  </div>
                  <span className="text-[10px] font-bold text-[#235857] bg-white border border-[#D3D9D4] px-2 py-0.5 rounded-lg">
                    {allTasks.filter(t => t.status === col).length}
                  </span>
                </div>
                <div className="space-y-4 min-h-[450px]">
                  {allTasks.filter(t => t.status === col).map((task) => (
                    <div key={task.id} onClick={() => setSelectedTask(task)} className="bg-white p-5 rounded-[2rem] border border-[#D3D9D4] shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#235857] transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] font-bold px-2 py-1 bg-[#F4F8F8] text-[#235857] rounded-lg uppercase tracking-widest">{task.domain}</span>
                        <div className="flex -space-x-2">
                          {task.assignees?.slice(0, 3).map((a, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-[#235857] border-2 border-white flex items-center justify-center text-[8px] font-bold text-white uppercase">{a.charAt(0)}</div>
                          ))}
                        </div>
                      </div>
                      <h3 className="text-[13px] font-semibold text-[#0D2426] group-hover:text-[#235857] line-clamp-2">{task.title}</h3>
                      <p className="text-[10px] text-[#6D8B8C] mt-1">{task.projectName}</p>
                      <div className="mt-4 flex items-center gap-1 text-[10px] text-[#6D8B8C] font-medium"><Clock size={12}/> {task.due}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TASK DETAILS MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0D2426]/70 backdrop-blur-md" onClick={() => { setSelectedTask(null); setIsEditingTask(false); }} />
          <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden max-h-[92vh]">
            
            <div className="flex-1 overflow-y-auto p-8 border-r border-[#F4F8F8]">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                  {isEditingTask ? (
                    <input 
                      className="text-2xl font-semibold w-full border-b-2 border-[#235857] outline-none pb-1 bg-transparent"
                      value={editData.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                    />
                  ) : (
                    <>
                      <h2 className="text-2xl font-semibold text-[#0D2426] mb-2">{selectedTask.title}</h2>
                      <p className="text-xs text-[#6D8B8C]">Project: {selectedTask.projectName} · Due: {selectedTask.due}</p>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {!isEditingTask && (
                    <button onClick={startEditing} className="p-2 hover:bg-[#F4F8F8] rounded-full text-[#235857] transition-colors">
                      <Edit3 size={20} />
                    </button>
                  )}
                  <button onClick={() => { setSelectedTask(null); setIsEditingTask(false); }} className="p-2 hover:bg-[#F4F8F8] rounded-full transition-colors"><X size={22} /></button>
                </div>
              </div>

              <section className="mb-8">
                <h4 className="text-[11px] font-bold text-[#235857] uppercase mb-3 flex items-center gap-2 tracking-widest">
                  <AlignLeft size={16}/> Description
                </h4>
                {isEditingTask ? (
                  <textarea 
                    className="w-full p-5 bg-[#FBFBFC] rounded-[1.5rem] border border-[#235857] min-h-[150px] outline-none text-sm"
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                  />
                ) : (
                  <div className="p-5 bg-[#FBFBFC] rounded-[1.5rem] border border-[#D3D9D4] text-sm text-[#355E5A] leading-relaxed">
                    {selectedTask.description || 'No description provided'}
                  </div>
                )}
              </section>

              {isEditingTask && (
                <div className="flex gap-3 mb-8">
                  <button onClick={handleSaveEdit} className="px-8 py-3 bg-[#235857] text-white rounded-xl font-bold flex items-center gap-2 shadow-lg">
                    <Check size={18}/> Save Changes
                  </button>
                  <button onClick={() => setIsEditingTask(false)} className="px-8 py-3 border border-[#D3D9D4] rounded-xl font-bold text-[#6D8B8C]">Cancel</button>
                </div>
              )}

              {!isEditingTask && (
                <section>
                  <h4 className="text-[11px] font-bold text-[#235857] uppercase mb-4 flex items-center gap-2 tracking-widest"><MessageSquare size={16}/> Activity Stream</h4>
                  <div className="mb-4 space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedTask.comments?.map((comment, idx) => (
                      <div key={idx} className="p-3 bg-white border border-[#D3D9D4] rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-[#0D2426]">{comment.user?.name || 'Team Member'}</span>
                          <span className="text-[9px] text-[#6D8B8C]">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-[#355E5A]">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <textarea 
                      value={commentText} 
                      onChange={(e) => setCommentText(e.target.value)} 
                      placeholder="Type a comment..." 
                      className="w-full bg-[#FBFBFC] border border-[#D3D9D4] rounded-[1.5rem] p-4 text-sm outline-none focus:border-[#235857] min-h-[100px] resize-none" 
                    />
                    <button onClick={handleAddComment} disabled={!commentText.trim()} className="px-6 py-2 bg-[#235857] text-white rounded-xl text-xs font-semibold disabled:bg-[#D3D9D4]">Add Comment</button>
                  </div>
                </section>
              )}
            </div>

            {/* MODAL SIDEBAR */}
            <div className="w-full lg:w-80 bg-[#FBFBFC] p-8 space-y-8">
              
              {/* REAL-TIME STATUS CONTROLLER */}
              <div>
                <h4 className="text-[11px] font-bold text-[#0D2426] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#235857]"/> Project Status
                </h4>
                <div className="flex flex-col gap-2">
                  {["Pending", "In Progress", "Completed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedTask.id, status)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-[11px] font-bold transition-all ${
                        selectedTask.status === status 
                          ? "bg-[#235857] text-white border-[#235857] shadow-lg shadow-[#235857]/20" 
                          : "bg-white text-[#6D8B8C] border-[#D3D9D4] hover:border-[#235857] hover:text-[#235857]"
                      }`}
                    >
                      {status}
                      {selectedTask.status === status && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {isEditingTask && (
                <div>
                  <label className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest mb-2 block">Change Due Date</label>
                  <input 
                    type="date"
                    className="w-full p-3 border border-[#D3D9D4] rounded-xl outline-none text-xs font-semibold bg-white"
                    value={editData.dueDate}
                    onChange={(e) => setEditData({...editData, dueDate: e.target.value})}
                  />
                </div>
              )}

              <div>
                <h4 className="text-[11px] font-bold text-[#0D2426] uppercase tracking-widest mb-4">Personnel Assigned</h4>
                <div className="space-y-3">
                  {selectedTask.assignees?.map((member, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#D3D9D4]">
                      <div className="w-7 h-7 rounded-full bg-[#235857] text-white flex items-center justify-center text-[9px] font-bold">{member.charAt(0)}</div>
                      <span className="text-xs font-semibold text-[#0D2426]">{member}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#D3D9D4]">
                <label className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest mb-2 block">Priority Level</label>
                <div className={`px-4 py-3 rounded-xl text-xs font-bold uppercase text-center ${selectedTask.priority === 'urgent' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                  {selectedTask.priority || 'Medium'}
                </div>
                <button 
                  onClick={() => handleDeleteTask(selectedTask.id)} 
                  className="w-full py-4 bg-white border border-[#D3D9D4] text-rose-600 rounded-2xl text-xs font-semibold hover:bg-rose-50 hover:border-rose-200 transition-all mt-4 flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Terminate Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setIsAssignModalOpen(true)} className="fixed bottom-8 right-8 w-14 h-14 bg-[#235857] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"><Plus size={24} /></button>
      <AssignTaskModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} onTaskCreated={handleTaskCreated} />
    </div>
  );
}