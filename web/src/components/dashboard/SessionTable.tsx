import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Tooltip,
    TablePagination,
    Box,
    Typography,
} from '@mui/material';
import {
    Visibility as ViewIcon,
    ContentCopy as DuplicateIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Session } from '../../services/sessionService';

interface SessionTableProps {
    sessions: Session[];
    onView: (id: string) => void;
    onDuplicate: (session: Session) => void;
    onDelete: (id: string) => void;
}

export default function SessionTable({ sessions, onView, onDuplicate, onDelete }: SessionTableProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ENDED': return 'default';
            case 'EXPIRED': return 'default'; // Use default (grey) for expired/ended
            case 'ACTIVE': return 'success';
            default: return 'default';
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - sessions.length) : 0;

    return (
        <Paper sx={{
            width: '100%',
            overflow: 'hidden',
            borderRadius: 3,
            boxShadow: 2,
            border: 1,
            borderColor: 'divider'
        }}>
            <TableContainer>
                <Table stickyHeader aria-label="sessions table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Session Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Course</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date Created</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Attendees</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sessions
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((session) => (
                                <TableRow hover key={session.id}>
                                    <TableCell component="th" scope="row">
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {session.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {session.course ? (
                                            <Chip label={session.course.name} size="small" variant="outlined" />
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">-</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(session.createdAt), 'MMM d, yyyy h:mm a')}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={session.status === 'EXPIRED' ? 'ENDED' : session.status}
                                            color={getStatusColor(session.status) as any}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {session._count?.attendance || 0}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="View Details">
                                            <IconButton color="primary" onClick={() => onView(session.id)} size="small">
                                                <ViewIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Duplicate Session">
                                            <IconButton color="info" onClick={() => onDuplicate(session)} size="small">
                                                <DuplicateIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton color="error" onClick={() => onDelete(session.id)} size="small">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={7} />
                            </TableRow>
                        )}
                        {sessions.length === 0 && (
                            <TableRow style={{ height: 100 }}>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="text.secondary">No sessions found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={sessions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}
