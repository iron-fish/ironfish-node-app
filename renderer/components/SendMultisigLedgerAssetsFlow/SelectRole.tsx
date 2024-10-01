import { PillButton } from "@/ui/PillButton/PillButton";

type SigningRole = "participant" | "coordinator"

export function SelectRole({ onChange }: { onChange: (role: SigningRole) => void } ) {
    return <div>
        <h1>Choose Role</h1>
        <PillButton
            type="submit"
            height="60px"
            px={8}
            onClick={() => onChange("participant")}
          >
            {"Participant"}
          </PillButton>
          <PillButton
            type="submit"
            height="60px"
            px={8}
            onClick={() => onChange("coordinator")}
          >
            {"Coordinator"}
          </PillButton>
    </div>
}
