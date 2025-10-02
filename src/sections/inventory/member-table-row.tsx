import { TableRow, TableCell, Button } from '@mui/material';
import { MemberItem } from 'src/models/inventory';

interface MemberTableRowProps {
  row: MemberItem;
  onEdit: (item: MemberItem) => void;
  onDelete: (id: string) => void;
}

export function MemberTableRow({ row, onEdit, onDelete }: MemberTableRowProps) {
  return (
    <TableRow>
      <TableCell>{row.nama}</TableCell>
      <TableCell>{row.email}</TableCell>
      <TableCell>{row.no_hp}</TableCell>
      <TableCell>{row.manager.nama}</TableCell>
      <TableCell>{row.no_ktp}</TableCell>
      <TableCell>
        {/* <Button variant="outlined" color="primary" onClick={() => onEdit(row)}>
          Edit
        </Button> */}
        <Button
          variant="outlined"
          color="error"
          onClick={() => onDelete(row.id)}
          sx={{ ml: 1 }}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
