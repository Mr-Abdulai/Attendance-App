import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Avatar,
    Divider,
} from '@mui/material';
import { Person as PersonIcon, Email as EmailIcon, Badge as BadgeIcon } from '@mui/icons-material';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface ProfileDialogProps {
    open: boolean;
    onClose: () => void;
    user: User | null;
}

export default function ProfileDialog({ open, onClose, user }: ProfileDialogProps) {
    if (!user) return null;

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const DetailRow = ({ icon, label, value }: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ color: 'text.secondary', mr: 2 }}>{icon}</Box>
            <Box>
                <Typography variant="caption" display="block" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="body1">{value}</Typography>
            </Box>
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: 'primary.main',
                            fontSize: '2rem',
                        }}
                    >
                        {initials}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                        {user.name}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Divider sx={{ mb: 3 }} />
                <DetailRow
                    icon={<EmailIcon />}
                    label="Email Address"
                    value={user.email}
                />
                <DetailRow
                    icon={<BadgeIcon />}
                    label="Role"
                    value={user.role}
                />
                <DetailRow
                    icon={<PersonIcon />}
                    label="User ID"
                    value={user.id}
                />
            </DialogContent>
            <DialogActions sx={{ pb: 3, px: 3 }}>
                <Button onClick={onClose} fullWidth variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
