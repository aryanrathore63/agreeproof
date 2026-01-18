import { 
  Agreement, 
  CreateAgreementRequest, 
  ApiResponse, 
  CreateAgreementResponse,
  AgreementStatusResponse 
} from '../types/agreement';

const API_BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'https://agreeproof.onrender.com/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async createAgreement(
    agreementData: CreateAgreementRequest
  ): Promise<ApiResponse<CreateAgreementResponse>> {
    return this.request<CreateAgreementResponse>('/agreements/create', {
      method: 'POST',
      body: JSON.stringify(agreementData),
    });
  }

  async getAgreement(
    agreementId: string
  ): Promise<ApiResponse<Agreement>> {
    return this.request<Agreement>(`/agreements/${agreementId}`, {
      method: 'GET',
    });
  }

  async confirmAgreement(
    agreementId: string
  ): Promise<ApiResponse<AgreementStatusResponse>> {
    return this.request<AgreementStatusResponse>(`/agreements/${agreementId}/confirm`, {
      method: 'POST',
    });
  }

  async getAgreementStatus(
    agreementId: string
  ): Promise<ApiResponse<AgreementStatusResponse>> {
    return this.request<AgreementStatusResponse>(`/agreements/${agreementId}/status`, {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();