import {ApiClient} from "../apiClient/ApiClient.ts";
type RegisterRequest={
    username:string,
    email:string,
    password:string,
}
type LoginRequest={
    email:string,
    password:string,
}

export interface AccountResponse {
    accountNumber: string;
    ownerUsername: string;
    balance: number;
    accountType: string;
    currency: string;
    status: string;
    createdDate: string;
}

export interface TransactionResponse {
    id: string;
    transactionReference: string;
    idempotencyKey: string;
    fromAccountNumber: string;
    toAccountNumber: string;
    amount: number;
    fee: number;
    currency: string;
    type: string;
    status: string;
    description: string;
    createdAt: string;
    initiatedBy: string;
}

export const AuthService={
    register: async (data:RegisterRequest)=>{
        try {
            const response = await ApiClient.post("/api/v1/register", data);
            return response.data;
        }catch (error :any){
            throw error.response?.data || "Register failed";
        }
    },
    login: async (data:LoginRequest)=>{
        try {
            const response = await ApiClient.post("/api/v1/login", data);
            return response.data;
        }catch (error :any){
            throw error.response?.data || "Login failed";
        }
    },
    getCurrentUser: async ()=>{
        try{
            const response=await ApiClient.get("/test/me")
            return response.data;
        }catch(error:any){
            throw error.response?.data || "Unable to get current user";
        }
},
    logout:async()=>{
        try{
            const resposne=await ApiClient.post("/api/v1/logout");
            return resposne.data;

        }catch(error:any){
            throw error.response?.data || "Logout failed";
        }
    },
    sendOtp: async (email: string) => {
        try {
            const response = await ApiClient.post("/api/v1/sendOtp", { email });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || "Failed to send OTP";
        }
    },
    verifyOtp: async (email: string, otp: string) => {
        try {
            const response = await ApiClient.post("/api/v1/verify", { email, otp });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || "OTP verification failed";
        }
    },
    getAccountsByUserId: async (userId: string): Promise<AccountResponse[]> => {
        try {
            const response = await ApiClient.get(`/accounts/user/${userId}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || "Failed to fetch accounts";
        }
    },
    getTransactionsByUserId: async (userId: string): Promise<TransactionResponse[]> => {
        try {
            const response = await ApiClient.get(`/transactions/user/${userId}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || "Failed to fetch transactions";
        }
    },
    transfer: async (fromAccount: string, toAccount: string, amount: number): Promise<string> => {
        try {
            const response = await ApiClient.post(`/transactions/transfer`, {
                fromAccount,
                toAccount,
                amount
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || "Transfer failed";
        }
    },
    deposit:async (accountNumber:string,amount:number):Promise<string>=>{
          try{
            const response=await ApiClient.post(`/transactions/deposit`,{
                accountNumber,
                amount
            });
            return response.data;
          }catch(error:any){
                throw error.response?.data || "Deposit failed";
          }
    },
    getAccountByNumber:async(accountNumber:string):Promise<AccountResponse>=>{
        try{
            const response=await ApiClient.get(`/accounts/${accountNumber}`);
            return response.data;

        }catch(error:any){
            throw error.response?.data || "Failed to fetch account details";
        }

    }
}