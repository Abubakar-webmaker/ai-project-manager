// src/pages/WorkspacePage.tsx
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Plus, Users, Settings, Activity,
  FolderKanban, Search, Grid3X3, List,
} from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchProjects } from "../features/project/store/projectSlice";
import { setCurrentWorkspace } from "../features/workspace/store/workspaceSlice";
import { workspaceService } from "../features/workspace/services/workspace.service";
import ProjectCard from "../features/project/components/ProjectCard";
import CreateProjectModal from "../features/project/components/CreateProjectModal";
import Button from "../components/ui/Button/Button";
import Spinner from "../components/ui/Spinner/Spinner";

type TabType = "projects" | "members" | "activity" | "settings";

const WorkspacePage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const { projects, isLoading: projectsLoading } = useAppSelector((state) => state.project);
  const { workspaces } = useAppSelector((state) => state.workspace);

  const [workspace, setWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("projects");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [members, setMembers] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (searchParams.get("newProject") === "true") {
      setShowCreateProject(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (workspaceId) {
      loadWorkspace();
      dispatch(fetchProjects(workspaceId));
    }
  }, [workspaceId]);

  const loadWorkspace = async () => {
    try {
      setIsLoading(true);
      const { data } = await workspaceService.getOne(workspaceId!);
      setWorkspace(data.data.workspace);
      setMembers(data.data.workspace.members || []);
      dispatch(setCurrentWorkspace(data.data.workspace));
    } catch {
      toast.error("Failed to load workspace");
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      const { data } = await workspaceService.getActivity(workspaceId!);
      setActivity(data.data.activity);
    } catch {
      console.error("Failed to load activity");
    }
  };

  useEffect(() => {
    if (activeTab === "activity") loadActivity();
  }, [activeTab]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      setInviting(true);
      await workspaceService.inviteMember(workspaceId!, {
        email: inviteEmail,
        role: "member",
      });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      loadWorkspace();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member?")) return;
    try {
      await workspaceService.removeMember(workspaceId!, memberId);
      toast.success("Member removed");
      loadWorkspace();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: "projects", label: "Projects", icon: FolderKanban },
    { key: "members", label: "Members", icon: Users },
    { key: "activity", label: "Activity", icon: Activity },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Workspace not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
            style={{ backgroundColor: workspace.color }}
          >
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {workspace.name}
            </h1>
            {workspace.description && (
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                {workspace.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {workspace.members?.length} members
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <FolderKanban className="w-3 h-3" />
                {projects.length} projects
              </span>
              <span className={clsx(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                workspace.plan === "free"
                  ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
              )}>
                {workspace.plan}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setShowCreateProject(true)}
          className="shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === "projects" && (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-1.5 py-0.5 rounded-full">
                  {projects.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={clsx(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "grid"
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={clsx(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "list"
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          {projectsLoading ? (
            <div className="flex items-center justify-center h-40">
              <Spinner size="lg" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <FolderKanban className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                No projects yet
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Create your first project to get started
              </p>
              <Button size="sm" onClick={() => setShowCreateProject(true)}>
                <Plus className="w-3.5 h-3.5" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className={clsx(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-3"
            )}>
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  workspaceId={workspaceId!}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div className="space-y-4">
          {/* Invite */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
              Invite Member
            </h3>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter email address..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button
                onClick={handleInvite}
                isLoading={inviting}
                size="sm"
              >
                Send Invite
              </Button>
            </div>
          </div>

          {/* Members List */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {members.map((member: any) => (
              <div
                key={member.user?._id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  {member.user?.avatar ? (
                    <img
                      src={member.user.avatar}
                      className="w-9 h-9 rounded-full object-cover"
                      alt={member.user.name}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {member.user?.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {member.user?.name}
                    </p>
                    <p className="text-xs text-slate-400">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={clsx(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    member.role === "owner"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                      : member.role === "admin"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}>
                    {member.role}
                  </span>
                  {member.role !== "owner" && (
                    <button
                      onClick={() => handleRemoveMember(member.user?._id)}
                      className="text-xs text-red-500 hover:text-red-700 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {activity.length === 0 ? (
            <div className="py-12 text-center">
              <Activity className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No activity yet</p>
            </div>
          ) : (
            activity.map((log: any) => (
              <div key={log._id} className="flex items-start gap-3 px-5 py-3">
                {log.actor?.avatar ? (
                  <img
                    src={log.actor.avatar}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    alt={log.actor.name}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-white">
                      {log.actor?.name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">{log.actor?.name}</span>{" "}
                    <span className="text-slate-500">
                      {log.action.replace(/_/g, " ")}
                    </span>
                    {log.metadata?.taskTitle && (
                      <span className="font-medium text-slate-900 dark:text-white">
                        {" "}&ldquo;{log.metadata.taskTitle}&rdquo;
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              Workspace Settings
            </h3>
            <p className="text-sm text-slate-400">
              Manage your workspace preferences
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                Workspace Name
              </label>
              <input
                defaultValue={workspace.name}
                className="w-full max-w-sm px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h4>
            <Button variant="danger" size="sm">
              Delete Workspace
            </Button>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        workspaceId={workspaceId!}
      />
    </div>
  );
};

export default WorkspacePage;