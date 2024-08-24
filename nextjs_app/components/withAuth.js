import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const withAuth = (WrappedComponent) => {
    return (props) => {
        const router = useRouter();

        useEffect(() => {
            const checkAuth = async () => {
                try {
                    await axios.get('/api/checkAuth');
                } catch (error) {
                    router.push('/');
                }
            };

            checkAuth();
        }, []);

        return <WrappedComponent {...props} />;
    };
};

export default withAuth;
