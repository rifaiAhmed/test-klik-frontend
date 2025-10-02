import { MemberItem } from 'src/models/inventory';

export interface ApiMeta {
  message: string;
  code: number;
  status: string;
  response_time: string;
  current_page: number;
  totalPages: number;
  totalData: number;
}

export interface ApiResponse {
  meta: ApiMeta;
  data: MemberItem[];
}

export interface Options {
  value: number;
  label: string;
}

export interface Dropdown {
  message: string;
  data: Options[];
}

const apiUrl = import.meta.env.VITE_API_URL;

const handleUnauthorized = () => {
  localStorage.removeItem('token');
  window.location.href = '/sign-in';
};

/**
 * Fetch members with pagination
 */
export const fetchMembers = async (params: {
  limit: number;
  skip: number;
  search?: string;
  sort_by?: string;
  sort_type?: string;
}): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem('token') || '';

    const queryParams = new URLSearchParams({
      limit: params.limit.toString(),
      skip: params.skip.toString(),
    });

    if (params.search) queryParams.append('search', params.search);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_type) queryParams.append('sort_type', params.sort_type);

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
      meta: {
        message: result.meta?.message ?? '',
        code: result.meta?.code ?? 0,
        status: result.meta?.status ?? '',
        response_time: result.meta?.response_time ?? '',
        current_page: result.meta?.current_page ?? 1,
        totalPages: result.meta?.totalPages ?? 0,
        totalData: result.meta?.totalData ?? 0,
      },
      data: result.data ?? [],
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

    const response = await fetch(`${apiUrl}members/${id}`, {
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

    const response = await fetch(`${apiUrl}members`, {
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

/**
 * Fetch list of managers (for dropdown)
 */
export async function fetchManagers(): Promise<Options[]> {
  try {
    const token = localStorage.getItem('token') || '';

    const response = await fetch(`${apiUrl}members/list-manager`, {
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

    const result: Dropdown = await response.json();
    return result.data ?? [];
  } catch (error) {
    console.error('Error fetching managers:', error);
    throw error;
  }
}

/**
 * Fetch list of pakets (for dropdown)
 */
export async function fetchPakets(): Promise<Options[]> {
  try {
    const token = localStorage.getItem('token') || '';

    const response = await fetch(`${apiUrl}members/list-paket`, {
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

    const result: Dropdown = await response.json();
    return result.data ?? [];
  } catch (error) {
    console.error('Error fetching managers:', error);
    throw error;
  }
}

/**
 * Fetch list of MemberList (for dropdown)
 */
export async function fetchMemberList(): Promise<Options[]> {
  try {
    const token = localStorage.getItem('token') || '';

    const response = await fetch(`${apiUrl}members/list-member`, {
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

    const result: Dropdown = await response.json();
    return result.data ?? [];
  } catch (error) {
    console.error('Error fetching managers:', error);
    throw error;
  }
}
