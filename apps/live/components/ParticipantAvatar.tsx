import { initialsOf, statusLabel, statusRingColor, type Participant } from '@/lib/identity';
import { Tooltip } from './Tooltip';

type ParticipantAvatarProps = {
  participant: Participant;
  // Diameter of the avatar circle in px (the status ring sits outside it).
  size?: number;
  // When true, wrap in a Tooltip with the participant's name + status.
  withTooltip?: boolean;
};

// Round avatar showing the participant's initials over their assigned
// colour, framed by a coloured "presence" ring (green / orange / red).
// Used in the editor header today; will appear next to comments and
// inside the collab cursor stack later.
export function ParticipantAvatar({
  participant,
  size = 28,
  withTooltip = false,
}: ParticipantAvatarProps) {
  const ringColor = statusRingColor(participant.status);
  // The ring is drawn as a 2px box-shadow with a 1px white gap inside.
  const avatar = (
    <div
      role="img"
      aria-label={`${participant.name} (${statusLabel(participant.status)})`}
      style={{
        width: size,
        height: size,
        backgroundColor: participant.color,
        boxShadow: `0 0 0 2px white, 0 0 0 4px ${ringColor}`,
      }}
      className="flex items-center justify-center rounded-full text-xs font-semibold text-white select-none"
    >
      <span style={{ fontSize: Math.round(size * 0.4) }}>{initialsOf(participant.name)}</span>
    </div>
  );
  if (!withTooltip) return avatar;
  return (
    <Tooltip title={participant.name} description={statusLabel(participant.status)}>
      {avatar}
    </Tooltip>
  );
}
