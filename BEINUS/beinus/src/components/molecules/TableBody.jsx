import Cell from "../atoms/Cell";
import styled from "styled-components";
import { flexRender } from "@tanstack/react-table";
import { Fragment } from "react";

const StyledTableBody = styled.div`
    min-height: "auto";
    display: flex;
    flex-direction: column;
    font-weight: 400;
    font-size: 14pt;
`;

const StyledTableRow = styled.div`
    &:hover {
        background-color: rgba(0, 0, 0, 0.04);
    }
`;

const TableBody = ({ rows }) => {
    return (
        <StyledTableBody>
            {rows.map((row) => (
                <Fragment key={row.id}>
                    <StyledTableRow className="row">
                        {row.getVisibleCells().map((cell) => (
                            <Cell key={cell.id} width={cell.column.getSize()}>
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </Cell>
                        ))}
                    </StyledTableRow>
                </Fragment>
            ))}
        </StyledTableBody>
    );
};

export default TableBody;
