import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useTable, usePagination, useSortBy } from 'react-table';
import './DataFetcher.css';

const DataFetcher = () => {
    const [licensingData, setLicensingData] = useState([]);
    const [nctData, setNCTData] = useState([]);
    const [licensingYear, setLicensingYear] = useState('');
    const [nctYear, setNCTYear] = useState('');
    const [loadingLicensing, setLoadingLicensing] = useState(false);
    const [loadingNCT, setLoadingNCT] = useState(false);
    const [pageSize] = useState(10000); // Set page size to 10000

    const fetchData = async (url, setter, loaderSetter) => {
        loaderSetter(true);
        try {
            const response = await axios.get(url);
            console.log(`${url} data received from API:`, response.data);
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        } finally {
            loaderSetter(false);
        }
    };

    const handleLicensingSubmit = (e) => {
        e.preventDefault();
        fetchData(`http://localhost:5000/api/licensing?year=${licensingYear}&page=1&pageSize=10000`, setLicensingData, setLoadingLicensing);
    };

    const handleNCTSubmit = (e) => {
        e.preventDefault();
        fetchData(`http://localhost:5000/api/nct?year=${nctYear}&page=1&pageSize=10000`, setNCTData, setLoadingNCT);
    };

    const columnsLicensing = useMemo(() => [
        { Header: 'Licensing ID', accessor: 'Licensing_ID' },
        { Header: 'Data Year', accessor: 'DataYear' },
        { Header: 'Number of Vehicles', accessor: 'NumberOfVehicles' },
        { Header: 'Make Description', accessor: 'MakeDescription' },
        { Header: 'Model Description', accessor: 'ModelDescription' },
        { Header: 'Age of Vehicle', accessor: 'AgeOfVehicle' },
        { Header: 'Fuel Type', accessor: 'FuelType' },
        { Header: 'Motor Tax Office', accessor: 'MotorTaxOffice' },
        { Header: 'Body Description', accessor: 'BodyDescription' },
        { Header: 'Tax Description', accessor: 'TaxDescription' },
        { Header: 'Engine CC', accessor: 'EngineCC' },
        { Header: 'VTA Value', accessor: 'VTAValue' },
        { Header: 'Gross Vehicle Weight', accessor: 'GrossVehicleWeight' },
        { Header: 'Registration Status', accessor: 'RegistrationStatus' },
    ], []);

    const columnsNCT = useMemo(() => [
        { Header: 'Unique ID', accessor: 'UniqueID' },
        { Header: 'Data Year', accessor: 'Data_Year' },
        { Header: 'Make', accessor: 'Make' },
        { Header: 'Model', accessor: 'Model' },
        { Header: 'Body Type', accessor: 'BodyType' },
        { Header: 'Fuel Type', accessor: 'FuelType' },
        { Header: 'Engine Size', accessor: 'EngineSize' },
        { Header: 'Year Of Manufacture', accessor: 'YearOfManufacture' },
        { Header: 'Tax Class', accessor: 'TaxClass' },
        { Header: 'County', accessor: 'County' },
        { Header: 'Time Of Test Registration', accessor: 'TimeOfTestRegistration' },
        { Header: 'Test Centre', accessor: 'TestCentre' },
        { Header: 'Test Date', accessor: 'TestDate' },
        { Header: 'Vehicle Test Weight', accessor: 'VehicleTestWeight' },
        { Header: 'Mileage KM', accessor: 'MileageKM' },
    ], []);

    const tableInstanceLicensing = useTable({
        columns: columnsLicensing,
        data: licensingData,
        initialState: { pageSize: pageSize },
    }, useSortBy, usePagination);

    const tableInstanceNCT = useTable({
        columns: columnsNCT,
        data: nctData,
        initialState: { pageSize: pageSize },
    }, useSortBy, usePagination);

    const renderTable = (tableInstance) => {
        const {
            getTableProps,
            getTableBodyProps,
            headerGroups,
            prepareRow,
            page,
            canPreviousPage,
            canNextPage,
            pageOptions,
            pageCount,
            gotoPage,
            nextPage,
            previousPage,
            setPageSize,
            state: { pageIndex, pageSize },
        } = tableInstance;

        return (
            <>
                <div className="table-container">
                    <table {...getTableProps()} className="table">
                        <thead>
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                            {column.render('Header')}
                                            <span>
                                                {column.isSorted
                                                    ? column.isSortedDesc
                                                        ? ' 🔽'
                                                        : ' 🔼'
                                                    : ''}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {page.map((row, i) => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map(cell => (
                                            <td key={cell.column.id} {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="pagination">
                    <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                        {'<<'}
                    </button>{' '}
                    <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                        {'<'}
                    </button>{' '}
                    <button onClick={() => nextPage()} disabled={!canNextPage}>
                        {'>'}
                    </button>{' '}
                    <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                        {'>>'}
                    </button>{' '}
                    <span>
                        Page{' '}
                        <strong>
                            {pageIndex + 1} of {pageOptions.length}
                        </strong>{' '}
                    </span>
                    <span>
                        | Go to page:{' '}
                        <input
                            type="number"
                            defaultValue={pageIndex + 1}
                            onChange={e => {
                                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                gotoPage(page);
                            }}
                            style={{ width: '100px' }}
                        />
                    </span>{' '}
                    <select
                        value={pageSize}
                        onChange={e => {
                            setPageSize(Number(e.target.value));
                        }}
                    >
                        {[10, 20, 30, 40, 50, 10000].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                Show {pageSize}
                            </option>
                        ))}
                    </select>
                </div>
            </>
        );
    };

    return (
        <div className="container">
            <h1>Data Fetcher</h1>

            <form onSubmit={handleLicensingSubmit} className="form">
                <h2 className="table-title">Fetch Licensing Data</h2>
                <label>
                    Licensing Year:
                    <input
                        type="number"
                        value={licensingYear}
                        onChange={(e) => setLicensingYear(e.target.value)}
                        required
                        placeholder="Enter year"
                    />
                </label>
                <button type="submit">Fetch Licensing Data</button>
                {loadingLicensing && <p>Loading licensing data...</p>}
            </form>

            {licensingData.length > 0 && (
                <div>
                    <h2 className="table-title">Licensing Data</h2>
                    {renderTable(tableInstanceLicensing)}
                </div>
            )}

            <form onSubmit={handleNCTSubmit} className="form">
                <h2 className="table-title">Fetch NCT Data</h2>
                <label>
                    NCT Year:
                    <input
                        type="number"
                        value={nctYear}
                        onChange={(e) => setNCTYear(e.target.value)}
                        required
                        placeholder="Enter year"
                    />
                </label>
                <button type="submit">Fetch NCT Data</button>
                {loadingNCT && <p>Loading NCT data...</p>}
            </form>

            {nctData.length > 0 && (
                <div>
                    <h2 className="table-title">NCT Data</h2>
                    {renderTable(tableInstanceNCT)}
                </div>
            )}
        </div>
    );
};

export default DataFetcher;
