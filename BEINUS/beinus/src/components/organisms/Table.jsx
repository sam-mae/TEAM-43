import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import styled from "styled-components";
import TableHead from "../molecules/TableHead";
import TableBody from "../molecules/TableBody";

// export const TableRenderSubRowComponent = (props: { row: Row }) =>
// React.ReactElement;

const TableContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    font-size: 14px;

    .row {
        width: 100%;
        display: flex;
        border-bottom: 1px solid rgba(224, 224, 224, 1);
    }
`;
function Table({ data, columns, row }) {
    // const { useMinHeight = true, data, columns, noDataMessage } = props;

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        // useFlexLayout,
    });

    const { getHeaderGroups, getRowModel } = table;

    return (
        <TableContainer>
            {getHeaderGroups().map((headerGroup, idx) => (
                <TableHead headers={headerGroup.headers} key={idx} />
            ))}
            <TableBody rows={getRowModel().rows} />
        </TableContainer>
    );
}

export default Table;
