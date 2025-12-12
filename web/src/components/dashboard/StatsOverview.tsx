
import {
    Grid,
    Paper,
    Typography,
    Box,
    useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Assignment as SessionIcon,
    People as PeopleIcon,
    CheckCircle as ActiveIcon,
    TrendingUp as TrendingIcon,
    BarChart as BarIcon,
} from '@mui/icons-material';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Session } from '../../services/sessionService';
import { format, parseISO } from 'date-fns';

interface StatsOverviewProps {
    sessions: Session[];
}

export default function StatsOverview({ sessions }: StatsOverviewProps) {
    const theme = useTheme();

    // 1. Calculate KPI Metrics
    const totalSessions = sessions.length;
    const totalAttendance = sessions.reduce((acc, curr) => acc + (curr._count?.attendance || 0), 0);
    const avgAttendance = totalSessions > 0 ? Math.round(totalAttendance / totalSessions) : 0;

    // 2. Prepare Chart Data (Group by Date)
    const dateMap = new Map<string, number>();

    // Process sessions in reverse (oldest first)
    [...sessions].reverse().forEach(session => {
        const dateStr = format(parseISO(session.createdAt), 'MMM dd');
        const currentCount = dateMap.get(dateStr) || 0;
        dateMap.set(dateStr, currentCount + (session._count?.attendance || 0));
    });

    const timelineData = Array.from(dateMap.entries()).map(([date, count]) => ({
        date,
        attendance: count
    }));

    if (timelineData.length === 0) {
        timelineData.push({ date: 'Today', attendance: 0 });
    }

    // 3. Prepare Bar Chart Data (Top 5 Sessions)
    const topSessions = [...sessions]
        .sort((a, b) => (b._count?.attendance || 0) - (a._count?.attendance || 0))
        .slice(0, 5)
        .map(s => ({
            name: s.name.length > 10 ? s.name.substring(0, 10) + '...' : s.name,
            count: s._count?.attendance || 0,
            fullDate: format(parseISO(s.createdAt), 'PP')
        }));

    const StatCard = ({ title, value, icon, color }: any) => (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                height: '100%',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(color, 0.05)} 100%)`,
                border: `1px solid ${theme.palette.divider}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                }
            }}
        >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                            borderRadius: 3,
                            p: 1.5,
                            color: '#fff',
                            display: 'flex',
                            boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, letterSpacing: '-1px' }}>
                    {value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {title}
                </Typography>
            </Box>
            {/* Decorative circle */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(color, 0.1)} 0%, transparent 70%)`,
                }}
            />
        </Paper>
    );

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* KPI Cards Row */}
            <Grid item xs={12} sm={6} md={4}>
                <StatCard
                    title="Total Sessions"
                    value={totalSessions}
                    icon={<SessionIcon />}
                    color={theme.palette.primary.main}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <StatCard
                    title="Total Check-ins"
                    value={totalAttendance}
                    icon={<PeopleIcon />}
                    color={theme.palette.secondary.main}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <StatCard
                    title="Avg. Attendance"
                    value={avgAttendance}
                    icon={<ActiveIcon />}
                    color={theme.palette.success.main}
                />
            </Grid>

            {/* Charts Row */}
            <Grid item xs={12} md={8}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.paper,
                        height: 420,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), mr: 2 }}>
                            <TrendingIcon sx={{ color: theme.palette.primary.main }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">Attendance Trends</Typography>
                            <Typography variant="body2" color="text.secondary">Participation over time</Typography>
                        </Box>
                    </Box>

                    <ResponsiveContainer width="100%" height="80%">
                        <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} dy={10} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 12, border: 'none', boxShadow: theme.shadows[4] }}
                                itemStyle={{ color: theme.palette.text.primary }}
                            />
                            <Area type="monotone" dataKey="attendance" stroke={theme.palette.primary.main} strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>

            {/* Top Sessions Bar Chart */}
            <Grid item xs={12} md={4}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.paper,
                        height: 420,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), mr: 2 }}>
                            <BarIcon sx={{ color: theme.palette.secondary.main }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">Top Sessions</Typography>
                            <Typography variant="body2" color="text.secondary">Highest turnout</Typography>
                        </Box>
                    </Box>

                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={topSessions} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{ fill: theme.palette.text.primary, fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 8 }} />
                            <Bar dataKey="count" fill={theme.palette.secondary.main} radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
        </Grid>
    );
}
