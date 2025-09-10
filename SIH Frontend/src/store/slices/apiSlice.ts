import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

// Backend API Types (aligned with backend models)
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'farmer' | 'processor' | 'lab' | 'consumer';
  createdAt: string;
}

export interface Collection {
  _id: string;
  farmerId: string | User;
  species: string;
  gpsCoordinates: {
    lat: number;
    lng: number;
  };
  harvestDate: string;
  quantity: number;
  image?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingStep {
  _id: string;
  batchId: string;
  processorId: string | User;
  stepType: 'drying' | 'grinding' | 'packaging' | 'sorting' | 'cleaning' | 'washing' | 'fermentation' | 'storage';
  date: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface QualityTest {
  _id: string;
  batchId: string;
  labId: string | User;
  moisture: number;
  pesticideLevel: number;
  dnaResult: string;
  certificateFile?: string;
  status: 'pass' | 'fail';
  testDate: string;
  createdAt: string;
}

export interface Batch {
  _id: string;
  collectionId: string | Collection;
  qrCode: string;
  status: 'created' | 'processing' | 'tested' | 'distributed';
  scanCount: number;
  scanHistory: Array<{
    scannedAt: string;
    location?: { lat: number; lng: number };
    scannedBy: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BatchDetails {
  batch: Batch;
  collection: Collection;
  processing: ProcessingStep[];
  qualityTests: QualityTest[];
}

export interface ProvenanceData {
  verified: boolean;
  batch: {
    id: string;
    qrCode: string;
    status: string;
    scanCount: number;
    createdAt: string;
  };
  provenance: {
    collection: Collection;
    processing: ProcessingStep[];
    qualityTests: QualityTest[];
  };
  timeline: Array<{
    date: string;
    event: string;
    details: Record<string, any>;
  }>;
}

export interface ScanStats {
  batchId: string;
  qrCode: string;
  totalScans: number;
  uniqueScans: number;
  scanHistory: Array<{
    scannedAt: string;
    location?: { lat: number; lng: number };
    scannedBy: string;
  }>;
  analytics: {
    firstScan?: string;
    lastScan?: string;
    averageScansPerDay: number;
  };
}

export interface SpeciesVerification {
  predicted_species: string;
  confidence: number;
  is_match: boolean;
  timestamp: string;
  note?: string;
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Collection', 'Batch', 'User', 'Processing', 'QualityTest'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<
      { user: User; token: string; message: string },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<
      { user: User; token: string; message: string },
      { email: string; password: string; name: string; role: 'farmer' | 'processor' | 'lab' | 'consumer' }
    >({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    
    // Farmer endpoints
    createCollection: builder.mutation<
      { message: string; collection: Collection; batch: { id: string; qrCode: string; status: string } },
      {
        farmerId: string;
        species: string;
        gpsCoordinates: { lat: number; lng: number };
        harvestDate: string;
        quantity: number;
        image?: string;
      }
    >({
      query: (collection) => ({
        url: '/collection',
        method: 'POST',
        body: collection,
      }),
      invalidatesTags: ['Collection', 'Batch'],
    }),
    getFarmerCollections: builder.query<
      { collections: Collection[]; total: number },
      string
    >({
      query: (farmerId) => `/collections/${farmerId}`,
      providesTags: ['Collection'],
    }),
    verifySpecies: builder.mutation<
      SpeciesVerification,
      { image: string; species: string }
    >({
      query: (data) => ({
        url: '/collection/verify-species',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Lab/Processing endpoints
    createProcessingStep: builder.mutation<
      { message: string; processing: ProcessingStep },
      {
        batchId: string;
        processorId: string;
        stepType: string;
        date: string;
        metadata?: Record<string, any>;
      }
    >({
      query: (step) => ({
        url: '/processing',
        method: 'POST',
        body: step,
      }),
      invalidatesTags: ['Batch', 'Processing'],
    }),
    getAvailableBatches: builder.query<Batch[], void>({
      query: () => '/batches',
      providesTags: ['Batch'],
    }),
    createQualityTest: builder.mutation<
      { message: string; qualityTest: QualityTest },
      {
        batchId: string;
        labId: string;
        moisture: number;
        pesticideLevel: number;
        dnaResult: string;
        certificateFile?: string;
      }
    >({
      query: (test) => ({
        url: '/quality-test',
        method: 'POST',
        body: test,
      }),
      invalidatesTags: ['Batch', 'QualityTest'],
    }),
    getBatchDetails: builder.query<BatchDetails, string>({
      query: (batchId) => `/batches/${batchId}`,
      providesTags: ['Batch'],
    }),
    getAllBatches: builder.query<
      {
        batches: Batch[];
        pagination: {
          total: number;
          pages: number;
          page: number;
          limit: number;
        };
      },
      { status?: string; limit?: number; page?: number }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append('status', params.status);
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.page) searchParams.append('page', params.page.toString());
        return `/batches?${searchParams.toString()}`;
      },
      providesTags: ['Batch'],
    }),
    
    // Consumer endpoints
    verifyProduct: builder.query<ProvenanceData, string>({
      query: (qrCode) => `/verify/${qrCode}`,
    }),
    getScanStats: builder.query<ScanStats, string>({
      query: (batchId) => `/scan-stats/${batchId}`,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useCreateCollectionMutation,
  useGetFarmerCollectionsQuery,
  useVerifySpeciesMutation,
  useCreateProcessingStepMutation,
  useGetAvailableBatchesQuery,
  useCreateQualityTestMutation,
  useGetBatchDetailsQuery,
  useGetAllBatchesQuery,
  useVerifyProductQuery,
  useGetScanStatsQuery,
} = apiSlice;