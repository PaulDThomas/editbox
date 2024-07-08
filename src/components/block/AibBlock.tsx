import styles from "./aib.module.css";
import { AibLineDisplay } from "./AibLineDisplay";
import { useBlockContext } from "./BlockContentProvider";

export const AibBlock = (): JSX.Element => {
  const { state } = useBlockContext();
  return !state ? (
    <></>
  ) : (
    <div
      id={state.id}
      className={styles.aibBlock}
    >
      {state.lines.map((l, li) => (
        <AibLineDisplay
          key={`${li}-${l.aifid}`}
          aifid={l.aifid}
        />
      ))}
    </div>
  );
};

AibBlock.DisplayName = "AibBlock";
