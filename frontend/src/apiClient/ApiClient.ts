import axios from "axios";

export const ApiClient=axios.create({
     baseURL:import.meta.env.VITE_BACKEND_URL,
     withCredentials:true
})
let isRefreshing=false;
let failedQueue:any=[];
const processQueue=(error:any)=>{
    failedQueue.forEach((prom:any)=>{
        if(error){
            prom.reject(error);
        }else{
            prom.resolve();
        }
    })
    failedQueue=[];
}

ApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;
            if(isRefreshing){
                return new Promise((resolve,reject)=>{
                    failedQueue.push({resolve,reject});
                }
                )
                .then(()=>ApiClient(originalRequest))
                .catch((err)=>Promise.reject(err));
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/refresh`, {}, { withCredentials: true });
                processQueue(null);
                return ApiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
