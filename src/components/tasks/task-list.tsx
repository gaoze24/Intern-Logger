"use client";

import { completeTaskAction } from "@/actions/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils/date";
import { toast } from "sonner";

type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  completed: boolean;
  priority: string;
  application: { companyName: string; roleTitle: string } | null;
};

export function TaskList({ tasks }: { tasks: TaskItem[] }) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={async () => {
                    if (!task.completed) {
                      await completeTaskAction(task.id);
                      toast.success("Task completed");
                    }
                  }}
                />
                <div>
                  <CardTitle className="text-base">{task.title}</CardTitle>
                  <CardDescription>{task.application ? `${task.application.companyName} · ${task.application.roleTitle}` : "General task"}</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled={task.completed}>
                {task.completed ? "Done" : "Open"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{task.description || "No notes"}</p>
            <p className="mt-2">Due: {formatDate(task.dueDate)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
