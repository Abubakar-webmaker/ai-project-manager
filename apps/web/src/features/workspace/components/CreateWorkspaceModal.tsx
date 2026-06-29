// src/features/workspace/components/CreateWorkspaceModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../../store/hooks";
import { fetchWorkspaces } from "../store/workspaceSlice";
import { workspaceService } from "../services/workspace.service";
import Modal from "../../../components/ui/Modal/Modal";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  description: z.string().max(200).optional(),
});

type FormData = z.infer<typeof schema>;

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4", "#84cc16", "#f43f5e",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWorkspaceModal = ({ isOpen, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      await workspaceService.create({ ...data, color: selectedColor });
      await dispatch(fetchWorkspaces());
      toast.success("Workspace created! 🎉");
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create workspace");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Workspace">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Workspace name"
          placeholder="My Awesome Team"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Description (optional)"
          placeholder="What is this workspace for?"
          error={errors.description?.message}
          {...register("description")}
        />

        {/* Color Picker */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && (
                  <span className="flex items-center justify-center text-white text-xs font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: selectedColor }}
          >
            W
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Workspace Preview
            </p>
            <p className="text-xs text-slate-400">This is how it will appear</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" fullWidth isLoading={isLoading}>
            Create Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateWorkspaceModal;