import axios, { Method } from "axios";
export default function fetcher (token:string,image:any)  {

    return async function(action:string,method:Method='POST'){
    try {
        const http = axios.create({
            baseURL:'https://api.app.getsmarteye.mobi/v1',
            withCredentials:false,
            timeout: 2000,
            headers: {
                'Authorization': 'Bearer '+token
            }
          });
         const res = await http.request({
             url:action,
             method,
             data:image
         });

        const code = res.status;
        if (code != 200) {
            console.error(JSON.stringify(res));
            throw new Error("An unexpected response was returned from the API Server");
        }
        return res.data;
    }
    catch (ex) {
        console.error(JSON.stringify(ex));
        throw new Error("There was an error with the API Request.");
    }
}
}