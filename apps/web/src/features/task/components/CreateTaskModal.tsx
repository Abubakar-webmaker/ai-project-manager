// src/features/task/components/CreateTaskModal.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchTasks } from "../store/taskSlice";
import { taskService } from "../services/task.service";
import Modal from "../../../components/ui/Modal/Modal";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";

const schema = z.object({
  title: z.string().min(1, "Title required").max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["none", "low", "medium", "high", "critical"]).default("none"),
  estimatedHours: z.number().min(0).optional(),
  dueDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const PRIORITIES = [
  { value: "none", label: "None", color: "text-slate-400" },
  { value: "low", label: "Low", color: "text-blue-500" },
  { value: "medium", label: "Medium", color: "text-yellow-500" },
  { value: "high", label: "High", color: "text-orange-500" },
  { value: "critical", label: "Critical", color: "text-red-500" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  defaultStatus?: string;
  members?: any[];
}

const CreateTaskModal = ({
  isOpen, onClose, projectId, defaultStatus = "todo", members = []
}: Props) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "none" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      await taskService.create(projectId, {
        ...data,
        status: defaultStatus,
        assignees: selectedAssignees,
        labels,
        estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : undefined,
      });
      await dispatch(fetchTasks(projectId));
      toast.success("Task created! ✅");
      reset();
      setSelectedAssignees([]);
      setLabels([]);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  const addLabel = () => {
    const trimmed = labelInput.trim();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels([...labels, trimmed]);
      setLabelInput("");
    }
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Task title"
          placeholder="What needs to be done?"
          error={errors.title?.message}
          {...register("title")}
        />

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
            Description
          </label>
          <textarea
            placeholder="Add more details..."
            rows={3}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            {...register("description")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Priority */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
              Priority
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register("priority")}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <Input
            label="Due Date"
            type="date"
            {...register("dueDate")}
          />
        </div>

        {/* Estimated Hours */}
        <Input
          label="Estimated Hours"
          type="number"
          placeholder="e.g. 4"
          {...register("estimatedHours", { valueAsNumber: true })}
        />

        {/* Assignees */}
        {members.length > 0 && (
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              Assignees
            </label>
            <div className="flex flex-wrap gap-2">
              {members.map((member: any) => {
                const user = member.user || member;
                const isSelected = selectedAssignees.includes(user._id);
                return (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => toggleAssignee(user._id)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                      {user.name?.charAt(0)}
                    </div>
                    {user.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Labels */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
            Labels
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add label..."
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLabel();
                }
              }}
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button type="button" size="sm" variant="outline" onClick={addLabel}>
              Add
            </Button>
          </div>
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {labels.map((label) => (
                <span
                  key={label}
                  className="flex items-center gap-1 text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => setLabels(labels.filter((l) => l !== label))}
                    className="hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" fullWidth isLoading={isLoading}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;