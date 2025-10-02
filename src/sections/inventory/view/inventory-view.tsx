import { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { MessageSnackbar } from 'src/layouts/components/MessageSnackBar';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { fetchMembers, deleteMember } from 'src/services/memberService';
import { MemberItem } from 'src/models/inventory';
import { TableNoData } from 'src/sections/user/table-no-data';
import { MemberTableRow } from '../member-table-row';
import { MemberModal } from '../member-modal';

export function MemberView() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [meta, setMeta] = useState({ totalData: 0, totalPages: 0, current_page: 1 });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [sortField, setSortField] = useState<'nama' | 'email' | 'no_hp' | 'manager' | 'paket'>('nama');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadMembers = useCallback(async () => {
    try {
      const response = await fetchMembers(
        page + 1,
        rowsPerPage,
        searchQuery,
        sortOrder,
        sortField
      );
      setMembers(response.data);
      // setMeta({
      //   totalData: response.meta.totalData,
      //   totalPages: response.meta.totalPages,
      //   current_page: response.meta.current_page,
      // });
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  }, [page, rowsPerPage, searchQuery, sortOrder, sortField]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setSearchQuery(tempSearch);
      setPage(0);
    }
  };

  const handleSort = (field: 'nama' | 'email' | 'no_hp' | 'manager' | 'paket') => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleEdit = (member: MemberItem) => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedMember(null);
    setModalOpen(true);
  };

  const handleDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteId(null);
    setDeleteConfirmOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteMember(deleteId);
        setMembers(members.filter((m) => m.id !== deleteId));
        loadMembers();
        handleSnackbar('Member berhasil dihapus!', 'success');
      } catch (error) {
        console.error('Failed to delete member:', error);
        handleSnackbar('Gagal menghapus member.', 'error');
      } finally {
        setDeleteConfirmOpen(false);
        setDeleteId(null);
      }
    }
  };

  return (
    <DashboardContent>
      <MessageSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity as any}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Member
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAdd}
        >
          Add Member
        </Button>
      </Box>

      <Card>
        <OutlinedInput
          fullWidth
          value={tempSearch}
          onChange={(event) => setTempSearch(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search member..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ maxWidth: 320, my: 3, ml: 5 }}
        />
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  {[
                    { key: 'nama', label: 'Nama' },
                    { key: 'email', label: 'Email' },
                    { key: 'no_hp', label: 'No HP' },
                    { key: 'manager', label: 'Manager' },
                    { key: 'paket', label: 'Paket' },
                  ].map((col) => (
                    <TableCell key={col.key}>
                      <TableSortLabel
                        active={sortField === col.key}
                        direction={sortField === col.key ? sortOrder : 'asc'}
                        onClick={() => handleSort(col.key as any)}
                      >
                        {col.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((row) => (
                  <MemberTableRow
                    key={row.id}
                    row={row}
                    onEdit={handleEdit}
                    onDelete={() => handleDeleteConfirm(row.id)}
                  />
                ))}
                {members.length === 0 && <TableNoData searchQuery={searchQuery} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={page}
          count={meta.totalData}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
        />
      </Card>

      <MemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        member={selectedMember}
        onSuccess={(message) => {
          loadMembers();
          handleSnackbar(message, 'success');
        }}
      />

      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Apakah kamu yakin ingin menghapus member ini?</DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
