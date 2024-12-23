import { nanoid } from "nanoid";
import { format } from 'date-fns';
import response from '../utils/response.js'
const { successResponse, badRequestResponse, notFoundResponse, serverErrorResponse, unauthorizedResponse } = response;
import dbConfig from '../db-config/db_config.js';
const { pool } = dbConfig; 

const redirect=async(req,res)=>{
    try{
        const url=req.params.url;
        if(!url) return badRequestResponse(res,"Url not given");
        const client = await pool.connect();
        try{
            await client.query('BEGIN');
            const response =await client.query('SELECT * FROM urldb WHERE short_url=$1', [url]);
            if (response.rows.length === 0) {
                return notFoundResponse(res, "Short URL not found");
            }
            const long_url=response.rows[0].long_url;
            const currentDate = new Date();
            await client.query('UPDATE urldb SET last_accessed=$1 WHERE short_url=$2',[format(currentDate, 'MM/dd/yyyy HH:mm:ss'),url])
            const ipAddress =await client.query('SELECT * FROM ip_address WHERE ip_address=$1 AND url_id=$2',[req.ip,response.rows[0].id]);
            if(ipAddress.rows.length==0){
                await client.query('INSERT INTO ip_address(ip_address, url_id, access_count) VALUES($1,$2,$3)',[req.ip, response.rows[0].id,1]);
            }else{
                await client.query('UPDATE ip_address SET access_count=access_count+1 WHERE ip_address=$1 AND url_id=$2 ',[ipAddress.rows[0].ip_address,response.rows[0].id])
            }
            await client.query('COMMIT');
            res.redirect(long_url);
        }catch(e){
            console.log(e);
            await client.query('ROLLBACK');
            return serverErrorResponse(res, 'Something went wrong while quering data');
        }finally {
            client.release();
        }
        // return successResponse(res,"Redirected successfully");
    }catch(err){
        console.log(err);
        return serverErrorResponse(res,"Internal server error");
    }
}

const url_shorten = async (req, res) => {
    try {
        const url = req.body.url;
        console.log(url);
        const isUrl = new URL(url); // This will throw an error if the URL is invalid
        if (isUrl) {
            const client = await pool.connect();
            try {  
                await client.query('BEGIN');
                const response = client.query('INSERT INTO urldb(long_url,short_url) VALUES($1, $2) RETURNING id,short_url', [url, nanoid(8)]);
                await client.query('COMMIT');
            } catch (err) {
                await client.query('ROLLBACK');
                return serverErrorResponse(res, 'Something went wrong while inserting data');
            } finally {
                client.release();
            }
            return successResponse(res,response,'Data insertion completed!')
        }
        else return badRequestResponse(res,"Invalid URL");
    } catch(e) {
        console.log(e);
        return serverErrorResponse(res,"Internal server error");
    }
}

export default {
    url_shorten,
    redirect
}