import { MemberItem } from 'src/models/inventory';

interface ApiResponse {
  meta: { totalData: number };
  data: MemberItem[];
}

const apiUrl = import.meta.env.VITE_API_URL;

const handleUnauthorized = () => {
  localStorage.removeItem('token');
  window.location.href = '/sign-in';
};

/**
 * Fetch members with pagination
 */
export const fetchMembers = async (
  page: number = 1,
  rowsPerPage: number = 5,
  search: string = '',
  sortType: string = '',
  sortBy: string = ''
): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem('token') || '';

    const queryParams = new URLSearchParams({
      limit: rowsPerPage.toString(),
      skip: ((page - 1) * rowsPerPage).toString(),
      sort_type: sortType,
      sort_by: sortBy,
    });

    if (search) queryParams.append('search', search);

    const response = await fetch(`${apiUrl}members?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: token ? `${token}` : '',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return {
      meta: { totalData: result.data?.total ?? 0 },
      data: result.data?.data ?? [],
    };
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

/**
 * Delete member by ID
 */
export async function deleteMember(id: string) {
  try {
    const token = localStorage.getItem('token') || '';

    const response = await fetch(`${apiUrl}member/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token ? `${token}` : '', 'Content-Type': 'application/json' },
    });

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) throw new Error('Failed to delete member');
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
}

/**
 * Create a new member
 */
export async function createMember(
  memberData: Omit<MemberItem, 'id' | 'manager' | 'registration'>
): Promise<MemberItem> {
  try {
    const token = localStorage.getItem('token') || '';

    const response = await fetch(`${apiUrl}member`, {
      method: 'POST',
      headers: { Authorization: token ? `${token}` : '', 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData),
    });

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create member: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating member:', error);
    throw error;
  }
}

/**
 * Update an existing member
 */
export async function updateMember(
  id: string,
  updatedData: Partial<Omit<MemberItem, 'manager' | 'registration'>>
): Promise<MemberItem> {
  try {
    const token = localStorage.getItem('token') || '';

    const response = await fetch(`${apiUrl}member/${id}`, {
      method: 'PUT',
      headers: { Authorization: token ? `${token}` : '', 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update member: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
}
