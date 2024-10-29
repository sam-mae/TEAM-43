import { Link } from "react-router-dom";
import styled from "styled-components";

const StyledLink = styled(Link)`
    text-decoration: none;
    color: #191919;
    font-weight: 600;
`;

const Anchor = ({
    to, // Link의 이동 위치
    children, // children
    className = "", // class
    ...props
}) => {
    return (
        <StyledLink className={`${className}`} to={to} {...props}>
            {children}
        </StyledLink>
    );
};

export default Anchor;
