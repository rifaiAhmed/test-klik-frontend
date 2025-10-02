import { useEffect, useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { createMember, updateMember } from 'src/services/memberService';
import { MemberItem } from 'src/models/inventory';

interface MemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  member?: MemberItem | null;
}

export function MemberModal({ open, onClose, onSuccess, member }: MemberModalProps) {
  const [form, setForm] = useState({
    nama: '',
    email: '',
    no_hp: '',
    no_ktp: '',
    manager_id: '',
    paket_id: '',
  });

  const [errors, setErrors] = useState({
    nama: '',
    email: '',
    no_hp: '',
    no_ktp: '',
    manager_id: '',
    paket_id: '',
  });

  useEffect(() => {
    if (member) {
      setForm({
        nama: member.nama || '',
        email: member.email || '',
        no_hp: member.no_hp || '',
        no_ktp: member.no_ktp || '',
        manager_id: member.manager_id ? member.manager_id.toString() : '',
        paket_id: member.registration?.paket_id
          ? member.registration.paket_id.toString()
          : '',
      });
    } else {
      setForm({
        nama: '',
        email: '',
        no_hp: '',
        no_ktp: '',
        manager_id: '',
        paket_id: '',
      });
    }
    setErrors({
      nama: '',
      email: '',
      no_hp: '',
      no_ktp: '',
      manager_id: '',
      paket_id: '',
    });
  }, [member, open]);

  const validateForm = useCallback(() => {
    let valid = true;
    const newErrors = { nama: '', email: '', no_hp: '', no_ktp: '', manager_id: '', paket_id: '' };

    if (!form.nama.trim()) {
      newErrors.nama = 'Nama wajib diisi';
      valid = false;
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email wajib diisi';
      valid = false;
    }
    if (!form.no_hp.trim()) {
      newErrors.no_hp = 'Nomor HP wajib diisi';
      valid = false;
    }
    if (!form.no_ktp.trim()) {
      newErrors.no_ktp = 'No KTP wajib diisi';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = useCallback(async () => {
    // if (!validateForm()) return;

    // try {
    //   const payload = {
    //     ...form,
    //     manager_id: form.manager_id ? Number(form.manager_id) : null,
    //     paket_id: form.paket_id ? Number(form.paket_id) : null,
    //   };

    //   if (member) {
    //     await updateMember(member.id, payload);
    //     onSuccess('Member berhasil diperbarui!');
    //   } else {
    //     await createMember(payload);
    //     onSuccess('Member berhasil ditambahkan!');
    //   }
    //   onClose();
    // } catch (error) {
    //   console.error('Failed to save member:', error);
    // }
  }, [form, member, onClose, onSuccess, validateForm]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{member ? 'Edit Member' : 'Add Member'}</DialogTitle>
      <DialogContent>
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
        <TextField
          fullWidth
          label="Manager ID"
          name="manager_id"
          value={form.manager_id}
          onChange={handleChange}
          error={!!errors.manager_id}
          helperText={errors.manager_id}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Paket ID"
          name="paket_id"
          value={form.paket_id}
          onChange={handleChange}
          error={!!errors.paket_id}
          helperText={errors.paket_id}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
