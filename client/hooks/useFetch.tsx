'use client'
import axios from "axios";
import { SetStateAction, useEffect, useState } from "react";

const useFetch = (url: string) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!url) return;
    
        const fetchData = async () => {
          setLoading(true);
          setError("");
          try {
            const response = await axios.get(url);
            setData(response.data);
          } catch (err) {
            setError(err as  SetStateAction<string> || "Something went wrong");
          } finally {
            setLoading(false);
          }
        };
    
        fetchData();
      }, [url]);
    
      return { data, loading, error };
}

export default useFetch;