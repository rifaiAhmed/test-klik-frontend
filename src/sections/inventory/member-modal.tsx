import { useEffect, useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

import { z } from 'zod';

import {
  createMember,
  updateMember,
  fetchManagers,
  fetchPakets,
  fetchMemberList,
  Options,
} from 'src/services/memberService';
import { MemberItem } from 'src/models/inventory';


const memberSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Email tidak valid'),
  no_hp: z.string().min(1, 'Nomor HP wajib diisi'),
  no_ktp: z.string().min(1, 'No KTP wajib diisi'),
  jenis_kelamin: z.enum(['Laki-laki', 'Perempuan'], 'Jenis kelamin wajib dipilih'),
  tempat_lahir: z.string().min(1, 'Tempat lahir wajib diisi'),
  tanggal_lahir: z
    .string()
    .min(1, 'Tanggal lahir wajib diisi')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  no_rekening: z.string().min(1, 'No rekening wajib diisi'),
  manager_id: z.coerce.number().refine((v) => v > 0, { message: 'Manager wajib dipilih' }),
  paket_id: z.coerce.number().refine((v) => v > 0, { message: 'Paket wajib dipilih' }),
  upline_member_id: z.coerce.number().refine((v) => v >= 0, { message: 'Upline wajib dipilih (boleh kosong=0)' }),
});

// type for parsed values
type MemberFormValues = z.infer<typeof memberSchema>;

interface MemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  member?: MemberItem | null;
}

export function MemberModal({ open, onClose, onSuccess, member }: MemberModalProps) {
  const [form, setForm] = useState<Record<string, string>>({
    nama: '',
    email: '',
    no_hp: '',
    no_ktp: '',
    jenis_kelamin: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    no_rekening: '',
    manager_id: '',
    paket_id: '',
    upline_member_id: '0',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [managers, setManagers] = useState<Options[]>([]);
  const [pakets, setPakets] = useState<Options[]>([]);
  const [members, setMembers] = useState<Options[]>([]);
  const [loading, setLoading] = useState(false);

  // load dropdown data when modal opens
  useEffect(() => {
    if (!open) return;

    setGeneralError(null);

    fetchManagers()
      .then((d) => setManagers(d))
      .catch((e) => {
        console.error('Failed to fetch managers:', e);
        setGeneralError((prev) => (prev ? `${prev}; gagal memuat managers` : 'Gagal memuat managers'));

      });

    fetchPakets()
      .then((d) => setPakets(d))
      .catch((e) => {
        console.error('Failed to fetch pakets:', e);
        setGeneralError((prev) => (prev ? `${prev}; gagal memuat paket` : 'Gagal memuat paket'));
      });

    fetchMemberList()
      .then((d) => setMembers(d))
      .catch((e) => {
        console.error('Failed to fetch member list:', e);
        setGeneralError((prev) => (prev ? `${prev}; gagal memuat member list` : 'Gagal memuat member list'));
      });
  }, [open]);

  // populate form when editing
  useEffect(() => {
    if (member) {
      setForm({
        nama: member.nama ?? '',
        email: member.email ?? '',
        no_hp: member.no_hp ?? '',
        no_ktp: member.no_ktp ?? '',
        jenis_kelamin: member.jenis_kelamin ?? '',
        tempat_lahir: member.tempat_lahir ?? '',
        tanggal_lahir: member.tanggal_lahir ?? '',
        no_rekening: member.no_rekening ?? '',
        manager_id: member.manager_id ? member.manager_id.toString() : '',
        paket_id: member.registration?.paket_id ? member.registration.paket_id.toString() : '',
        upline_member_id: member.registration?.upline_member_id ? member.registration.upline_member_id.toString() : '0',
      });
    } else {
      // reset
      setForm({
        nama: '',
        email: '',
        no_hp: '',
        no_ktp: '',
        jenis_kelamin: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        no_rekening: '',
        manager_id: '',
        paket_id: '',
        upline_member_id: '0',
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [member, open]);

  const validateForm = useCallback(() => {
    setErrors({});
    setGeneralError(null);

    const payloadToValidate: Record<string, unknown> = {
      nama: form.nama,
      email: form.email,
      no_hp: form.no_hp,
      no_ktp: form.no_ktp,
      jenis_kelamin: form.jenis_kelamin,
      tempat_lahir: form.tempat_lahir,
      tanggal_lahir: form.tanggal_lahir,
      no_rekening: form.no_rekening,
      manager_id: form.manager_id,
      paket_id: form.paket_id,
      upline_member_id: form.upline_member_id || '0',
    };

    const parseResult = memberSchema.safeParse(payloadToValidate);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((err) => {
        const path = err.path[0] as string;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return { ok: false };
    }

    return { ok: true, values: parseResult.data as MemberFormValues };
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSave = useCallback(async () => {
    setGeneralError(null);
    const result = validateForm();
    if (!result.ok) return;

    const values = result.values as MemberFormValues;

    const payload: Omit<MemberItem, 'id' | 'manager' | 'registration'> = {
      nama: values.nama,
      email: values.email,
      no_hp: values.no_hp,
      no_ktp: values.no_ktp,
      jenis_kelamin: values.jenis_kelamin,
      tempat_lahir: values.tempat_lahir,
      tanggal_lahir: values.tanggal_lahir,
      no_rekening: values.no_rekening,
      manager_id: values.manager_id,
      paket_id: values.paket_id,
      Registartion_id: 0,
      created_at: '',
      updated_at: '',
      deleted_at: null,
      upline_member_id: values.upline_member_id ? String(values.upline_member_id) : '',
    } as any;

    setLoading(true);
    try {
      if (member) {
        await updateMember(member.id, payload);
        onSuccess('Member berhasil diperbarui!');
      } else {
        await createMember(payload);
        onSuccess('Member berhasil ditambahkan!');
      }
      onClose();
    } catch (err: any) {
      if (err?.message) setGeneralError(String(err.message));
      else setGeneralError('Gagal menyimpan member');
    } finally {
      setLoading(false);
    }
  }, [member, onClose, onSuccess, validateForm]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{member ? 'Edit Member' : 'Add Member'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {generalError && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error">{generalError}</Alert>
            </Box>
          )}

          <TextField
            fullWidth
            label="Nama"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            error={!!errors.nama}
            helperText={errors.nama}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Nomor HP"
            name="no_hp"
            value={form.no_hp}
            onChange={handleChange}
            error={!!errors.no_hp}
            helperText={errors.no_hp}
            margin="normal"
          />

          <TextField
            fullWidth
            label="No KTP"
            name="no_ktp"
            value={form.no_ktp}
            onChange={handleChange}
            error={!!errors.no_ktp}
            helperText={errors.no_ktp}
            margin="normal"
          />

          {/* Jenis Kelamin dropdown */}
          <TextField
            select
            fullWidth
            label="Jenis Kelamin"
            name="jenis_kelamin"
            value={form.jenis_kelamin}
            onChange={handleChange}
            error={!!errors.jenis_kelamin}
            helperText={errors.jenis_kelamin}
            margin="normal"
          >
            <MenuItem value="Laki-laki">Laki-laki</MenuItem>
            <MenuItem value="Perempuan">Perempuan</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Tempat Lahir"
            name="tempat_lahir"
            value={form.tempat_lahir}
            onChange={handleChange}
            error={!!errors.tempat_lahir}
            helperText={errors.tempat_lahir}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Tanggal Lahir (YYYY-MM-DD)"
            name="tanggal_lahir"
            value={form.tanggal_lahir}
            onChange={handleChange}
            error={!!errors.tanggal_lahir}
            helperText={errors.tanggal_lahir}
            margin="normal"
          />

          <TextField
            fullWidth
            label="No Rekening"
            name="no_rekening"
            value={form.no_rekening}
            onChange={handleChange}
            error={!!errors.no_rekening}
            helperText={errors.no_rekening}
            margin="normal"
          />

          {/* Manager dropdown */}
          <TextField
            select
            fullWidth
            label="Manager"
            name="manager_id"
            value={form.manager_id}
            onChange={handleChange}
            error={!!errors.manager_id}
            helperText={errors.manager_id}
            margin="normal"
          >
            <MenuItem value="">— Pilih Manager —</MenuItem>
            {managers.map((m) => (
              <MenuItem key={m.value} value={String(m.value)}>
                {m.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Paket dropdown */}
          <TextField
            select
            fullWidth
            label="Paket"
            name="paket_id"
            value={form.paket_id}
            onChange={handleChange}
            error={!!errors.paket_id}
            helperText={errors.paket_id}
            margin="normal"
          >
            <MenuItem value="">— Pilih Paket —</MenuItem>
            {pakets.map((p) => (
              <MenuItem key={p.value} value={String(p.value)}>
                {p.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Upline Member"
            name="upline_member_id"
            value={form.upline_member_id}
            onChange={handleChange}
            error={!!errors.upline_member_id}
            helperText={errors.upline_member_id}
            margin="normal"
          >
            <MenuItem value="0">— Tidak Ada / Pilih Upline —</MenuItem>
            {members.map((mm) => (
              <MenuItem key={mm.value} value={String(mm.value)}>
                {mm.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {member ? (loading ? 'Updating...' : 'Update') : loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
