import LivingShell from "@/components/LivingShell";
import RedCursor from "@/components/RedCursor";
import SceneRegistry from "@/components/SceneRegistry";

export default function Home() {
  return (
    <>
      <RedCursor />

      <LivingShell>
        <SceneRegistry scene="home" />
      </LivingShell>
    </>
  );
}
