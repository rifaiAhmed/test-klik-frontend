export interface InventoryItem {
  id: number;
  item: string;
  qty: number;
  uom: string;
  price_per_qty: number;
}

export interface Location {
  id: number;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  kode_pos: string;
  detail: string;
  created_at: string;
  updated_at: string;
}

export interface Manager {
  id: number;
  nama: string;
  location_id: number;
  location: Location;
  created_at: string;
  updated_at: string;
}

export interface Paket {
  id: number;
  nama_paket: string;
  jenis_paket: string;
  wilayah: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: number;
  member_id: string;
  upline_member_id: string;
  paket_id: number;
  paket: Paket;
  created_at: string;
  updated_at: string;
}

export interface MemberItem {
  id: string;
  nama: string;
  jenis_kelamin: string;
  no_ktp: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  no_hp: string;
  email: string;
  no_rekening: string;
  manager_id: number;
  paket_id: number;
  manager: Manager;
  Registartion_id: number;
  registration: Registration;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  upline_member_id: string;
}

export interface MembersResponse {
  message: string;
  data: {
    data: MemberItem[];
    total: number;
  };
}
