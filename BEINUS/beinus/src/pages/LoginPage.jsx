import PageTemplate from "../components/templates/PageTemplate";
import Photo from "../components/atoms/Photo";
import Anchor from "../components/atoms/Anchor";
import LoginForm from "../components/organisms/LoginForm";

const LoginPage = () => {
    return (
        // <Suspense fallback={<Loader />}>
        <PageTemplate className="login-page">
            <Anchor to="/">
                <Photo src="./assets/logo.png" alt="로고" width="240px" />
            </Anchor>
            <LoginForm />
        </PageTemplate>
        // </Suspense>
    );
};

export default LoginPage;
