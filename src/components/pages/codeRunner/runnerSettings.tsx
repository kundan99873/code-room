import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  endpoint: string;
  onSave: (v: string) => void;
  jsMode: "browser" | "server";
  tsMode: "browser" | "server";
  pyMode: "browser" | "server";
  onModeChange: (langId: string, mode: "browser" | "server") => void;
};

export function RunnerSettings({
  endpoint,
  onSave,
  jsMode,
  tsMode,
  pyMode,
  onModeChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(endpoint);
  const [localJsMode, setLocalJsMode] = useState(jsMode);
  const [localTsMode, setLocalTsMode] = useState(tsMode);
  const [localPyMode, setLocalPyMode] = useState(pyMode);

  useEffect(() => {
    setVal(endpoint);
    setLocalJsMode(jsMode);
    setLocalTsMode(tsMode);
    setLocalPyMode(pyMode);
  }, [endpoint, jsMode, tsMode, pyMode, open]);

  const handleSave = () => {
    onSave(val.trim());
    onModeChange("javascript", localJsMode);
    onModeChange("typescript", localTsMode);
    onModeChange("python", localPyMode);
    setOpen(false);
  };

  const handleClear = () => {
    onSave("");
    setLocalJsMode("browser");
    setLocalTsMode("browser");
    setLocalPyMode("browser");
    onModeChange("javascript", "browser");
    onModeChange("typescript", "browser");
    onModeChange("python", "browser");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" title="Runner settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Runner settings</DialogTitle>
          <DialogDescription>
            Best setup: keep JavaScript, TypeScript, Python, and HTML local for instant runs, then add a self-hosted Piston endpoint for Java, C++, Go, Rust, C#, Ruby, and Bash.
            Point this app at your own{" "}
            <a className="underline" href="https://github.com/engineer-man/piston" target="_blank" rel="noreferrer">
              self-hosted Piston
            </a>{" "}
            instance for the most reliable server-language execution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="piston-url">Piston execute endpoint</Label>
            <Input
              id="piston-url"
              placeholder="https://your-piston.example.com/api/v2/execute"
              value={val}
              onChange={(e) => setVal(e.target.value)}
            />
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div>
              <Label className="text-sm font-semibold leading-none text-foreground">Execution Environments</Label>
              <p className="text-[11px] text-muted-foreground mt-1">
                Choose where execution occurs. Browser sandbox runs client-side inside an isolated iframe, while Server executes containerized code.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">JavaScript</Label>
                <Select value={localJsMode} onValueChange={(v: any) => setLocalJsMode(v)}>
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="browser">Browser</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">TypeScript</Label>
                <Select value={localTsMode} onValueChange={(v: any) => setLocalTsMode(v)}>
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="browser">Browser</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Python</Label>
                <Select value={localPyMode} onValueChange={(v: any) => setLocalPyMode(v)}>
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="browser">Browser</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>Clear</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
