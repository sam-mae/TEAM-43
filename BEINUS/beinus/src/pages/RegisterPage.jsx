// import { Suspense } from "react";
// import Loader from "../components/atoms/Loader";
// import RegisterTemplate from "../components/templates/RegisterTemplate";
import PageTemplate from "../components/templates/PageTemplate";
import Anchor from "../components/atoms/Anchor";
import Photo from "../components/atoms/Photo";
import RegisterForm from "../components/organisms/RegisterForm";

const RegisterPage = () => {
    return (
        // <Suspense fallback={<Loader />}>
        //     <RegisterTemplate />
        // </Suspense>

        <PageTemplate className="register-page">
            <Anchor to="/">
                <Photo src="./assets/logo.png" alt="로고" width="240px" />
            </Anchor>
            <RegisterForm />
        </PageTemplate>
    );
};

export default RegisterPage;
