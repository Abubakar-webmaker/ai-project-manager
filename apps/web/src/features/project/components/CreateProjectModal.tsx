// src/features/project/components/CreateProjectModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../../store/hooks";
import { fetchProjects } from "../store/projectSlice";
import { projectService } from "../services/project.service";
import Modal from "../../../components/ui/Modal/Modal";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#22c55e", "#14b8a6", "#3b82f6",
];

const ICONS = ["📋", "🚀", "💡", "🎯", "⚡", "🔥", "🌟", "💎", "🛠️", "📱", "🎨", "📊"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

const CreateProjectModal = ({ isOpen, onClose, workspaceId }: Props) => {
  const dispatch = useAppDispatch();
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      await projectService.create(workspaceId, {
        ...data,
        color: selectedColor,
        icon: selectedIcon,
        visibility,
      });
      await dispatch(fetchProjects(workspaceId));
      toast.success("Project created! 🚀");
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Project" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Project name"
          placeholder="My Awesome Project"
          error={errors.name?.message}
          {...register("name")}
        />

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
            Description (optional)
          </label>
          <textarea
            placeholder="What is this project about?"
            rows={3}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            {...register("description")}
          />
        </div>

        {/* Icon Picker */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setSelectedIcon(icon)}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                  selectedIcon === icon
                    ? "bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-500"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
            Color
          </label>
          <div className="flex gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className="w-7 h-7 rounded-lg transition-transform hover:scale-110 flex items-center justify-center"
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
            Visibility
          </label>
          <div className="flex gap-3">
            {(["private", "public"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  visibility === v
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                    : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {v === "private" ? "🔒 Private" : "🌐 Public"}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: selectedColor + "20", border: `2px solid ${selectedColor}` }}
          >
            {selectedIcon}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Project Preview
            </p>
            <p className="text-xs text-slate-400">{visibility} project</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" fullWidth isLoading={isLoading}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;