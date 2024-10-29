import Cell from "../atoms/Cell";
import styled from "styled-components";
import { flexRender } from "@tanstack/react-table";

const StyledHeader = styled.div`
    font-weight: 600;
    font-size: 16pt;
`;

const TableHead = ({ headers }) => {
    return (
        <StyledHeader className="row">
            {headers.map((header) =>
                header.isPlaceholder ? null : (
                    <Cell key={header.id} width={header.column.getSize()}>
                        {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                        )}
                    </Cell>
                )
            )}
        </StyledHeader>
    );
};

export default TableHead;
