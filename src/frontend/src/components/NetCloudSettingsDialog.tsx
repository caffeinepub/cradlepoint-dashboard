import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCredentials } from "@/lib/auth";
import { Eye, EyeOff, Loader2, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

export default function NetCloudSettingsDialog() {
  const { actor } = useActor();
  const { username, password } = getCredentials();

  const [open, setOpen] = useState(false);
  const [cpApiId, setCpApiId] = useState("");
  const [cpApiKey, setCpApiKey] = useState("");
  const [ecmApiId, setEcmApiId] = useState("");
  const [ecmApiKey, setEcmApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [hasKeys, setHasKeys] = useState<boolean | null>(null);

  const [showCpApiId, setShowCpApiId] = useState(false);
  const [showCpApiKey, setShowCpApiKey] = useState(false);
  const [showEcmApiId, setShowEcmApiId] = useState(false);
  const [showEcmApiKey, setShowEcmApiKey] = useState(false);

  useEffect(() => {
    if (!open || !actor) return;
    setCheckingStatus(true);
    // Cast to any because backendInterface is a generated protected file that
    // doesn't yet include the new NetCloud methods.
    (actor as any)
      .getNetCloudKeyStatus(username, password)
      .then((status: { hasKeys: boolean }) => {
        setHasKeys(status.hasKeys);
      })
      .catch(() => {
        setHasKeys(false);
      })
      .finally(() => {
        setCheckingStatus(false);
      });
  }, [open, actor, username, password]);

  const handleSave = async () => {
    if (!actor) {
      toast.error("Backend not available. Please refresh.");
      return;
    }
    if (
      !cpApiId.trim() ||
      !cpApiKey.trim() ||
      !ecmApiId.trim() ||
      !ecmApiKey.trim()
    ) {
      toast.error("Please fill in all four API key fields.");
      return;
    }
    setSaving(true);
    try {
      await (actor as any).saveNetCloudKeys(
        username,
        password,
        cpApiId.trim(),
        cpApiKey.trim(),
        ecmApiId.trim(),
        ecmApiKey.trim(),
      );
      setHasKeys(true);
      toast.success("NetCloud API keys saved successfully.");
      setOpen(false);
    } catch (err: any) {
      toast.error(`Failed to save keys: ${err?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="NetCloud API Settings"
          data-ocid="netcloud.settings.open_modal_button"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        data-ocid="netcloud.settings.dialog"
      >
        <DialogHeader>
          <DialogTitle>NetCloud API Settings</DialogTitle>
          <DialogDescription>
            Enter your Cradlepoint NetCloud API credentials. Keys are stored
            securely on the backend.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 py-1">
          {checkingStatus ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : hasKeys === true ? (
            <Badge
              variant="secondary"
              className="bg-green-100 text-xs text-green-700"
            >
              ✓ Keys configured
            </Badge>
          ) : hasKeys === false ? (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              No keys saved
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-3">
          <PasswordField
            id="cp-api-id"
            label="X-CP-API-ID"
            value={cpApiId}
            onChange={setCpApiId}
            show={showCpApiId}
            onToggleShow={() => setShowCpApiId((v) => !v)}
            dataOcid="netcloud.cp_api_id.input"
          />
          <PasswordField
            id="cp-api-key"
            label="X-CP-API-KEY"
            value={cpApiKey}
            onChange={setCpApiKey}
            show={showCpApiKey}
            onToggleShow={() => setShowCpApiKey((v) => !v)}
            dataOcid="netcloud.cp_api_key.input"
          />
          <PasswordField
            id="ecm-api-id"
            label="X-ECM-API-ID"
            value={ecmApiId}
            onChange={setEcmApiId}
            show={showEcmApiId}
            onToggleShow={() => setShowEcmApiId((v) => !v)}
            dataOcid="netcloud.ecm_api_id.input"
          />
          <PasswordField
            id="ecm-api-key"
            label="X-ECM-API-KEY"
            value={ecmApiKey}
            onChange={setEcmApiKey}
            show={showEcmApiKey}
            onToggleShow={() => setShowEcmApiKey((v) => !v)}
            dataOcid="netcloud.ecm_api_key.input"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving}
            data-ocid="netcloud.settings.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            data-ocid="netcloud.settings.save_button"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Keys"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  dataOcid: string;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  dataOcid,
}: PasswordFieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label}`}
          className="pr-10 font-mono text-sm"
          data-ocid={dataOcid}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={show ? "Hide" : "Show"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
