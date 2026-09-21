import {
  IconPlus,
  IconAdjustments,
  IconList,
  IconBook2,
  IconGitBranch,
  IconRefresh,
  IconHistory,
  IconEye,
  IconArrowsDiff,
  IconFileCode,
  IconClock,
  IconRecycle,
  IconRotate360,
  IconArrowsShuffle,
  IconRotateClockwise,
  IconArchive,
  IconPointFilled,
  IconCopy,
  IconSatellite,
  IconDownload,
  IconUpload,
  IconTag,
  IconCamera,
  IconSearch,
  IconTools,
  IconTerminal2,
  IconGitMerge,
  IconGitCommit,
  type IconProps,
} from "@tabler/icons-react";

const MAP: Record<string, React.ComponentType<IconProps>> = {
  plus: IconPlus,
  settings: IconAdjustments,
  list: IconList,
  book: IconBook2,
  "git-branch": IconGitBranch,
  box: IconRefresh,
  history: IconHistory,
  eye: IconEye,
  "arrows-diff": IconArrowsDiff,
  file: IconFileCode,
  clock: IconClock,
  broom: IconRecycle,
  "rotate-360": IconRotate360,
  "arrows-shuffle": IconArrowsShuffle,
  "rotate-clockwise": IconRotateClockwise,
  archive: IconArchive,
  point: IconPointFilled,
  copy: IconCopy,
  satellite: IconSatellite,
  download: IconDownload,
  upload: IconUpload,
  tag: IconTag,
  camera: IconCamera,
  search: IconSearch,
  rotate: IconTools,
  tools: IconTools,
  "git-merge": IconGitMerge,
  "git-commit": IconGitCommit,
};

export function CommandIcon({
  name,
  size = 20,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = MAP[name] ?? IconTerminal2;
  return <Icon size={size} className={className} />;
}