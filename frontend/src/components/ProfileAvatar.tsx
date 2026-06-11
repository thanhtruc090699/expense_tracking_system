import Avatar from "boring-avatars";
import "../styles/ProfileAvatar.css";

interface ProfileAvatarProps {
  name: string;
  size?: number;
  variant?: "marble" | "beam" | "pixel" | "sunset" | "ring" | "bauhaus";
  colors?: string[];
  square?: boolean;
}

export function ProfileAvatar({ 
  name, 
  size = 72, 
  variant = "bauhaus",
  colors = ["#1e5128", "#d9f2a3", "#4a7c59", "#f0f0f0", "#2d5a3d"],
  square = false
}: ProfileAvatarProps) {
  return (
    <div className={`profile-avatar ${square ? 'square' : ''}`}>
      <Avatar
        size={size}
        name={name}
        variant={variant}
        colors={colors}
        square={square}
      />
    </div>
  );
}
