import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

type Props = { endpoint: string; onSave: (v: string) => void };

export function RunnerSettings({ endpoint, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(endpoint);
  useEffect(() => setVal(endpoint), [endpoint, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" title="Runner settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Runner settings</DialogTitle>
          <DialogDescription>
            Best setup: keep JavaScript, TypeScript, Python, PHP, and HTML local for instant runs, then add a self-hosted Piston endpoint for Java, C++, Go, Rust, C#, Ruby, and Bash. Codex stays only as a free fallback when it is healthy.
            Point this app at your own{" "}
            <a className="underline" href="https://github.com/engineer-man/piston" target="_blank" rel="noreferrer">
              self-hosted Piston
            </a>{" "}
            instance for the most reliable server-language execution.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="piston-url">Piston execute endpoint</Label>
          <Input
            id="piston-url"
            placeholder="https://your-piston.example.com/api/v2/execute"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onSave(""); setOpen(false); }}>Clear</Button>
          <Button onClick={() => { onSave(val.trim()); setOpen(false); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
