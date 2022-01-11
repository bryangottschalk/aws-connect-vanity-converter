import { ReactElement, useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import axios, { AxiosResponse } from 'axios';
import columns from './columns';
import TableColumn from '../../types/TableColumn';
import { CircularProgress } from '@mui/material';

interface VanityNumberDTO {
  [key: string]: any;
  callerPhoneNumber: string;
  formattedPhoneNumber: string;
  vanityNumbers: string[];
}

const ComponentContainer = styled.div`
  margin: 0px 32px;
`;

const Title = styled.h1`
  margin: 0px;
  padding: 16px 0px 16px 16px;
  color: #61dafb;
`;

const BoldTableCell = styled(TableCell)`
  font-weight: bold !important;
  font-size: 1.3rem !important;
  padding: 24px !important;
`;

const MyTableCell = styled(TableCell)`
  font-size: 1rem !important;
  padding: 24px !important;
`;

const ErrorMsg = styled.h2`
  padding: 24px;
  color: red;
`;

const MyCircularProgress = styled(CircularProgress)`
  padding: 24px;
`;

export default function VanityNumberTable(): ReactElement {
  const [vanityNumberResults, setVanityNumberResults] = useState<
    VanityNumberDTO[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // TODO: inject api url into process.env from Amplify SAM Template
        const { data }: AxiosResponse<VanityNumberDTO[]> = await axios.get(
          'https://pndcjwkl1k.execute-api.us-east-1.amazonaws.com/Prod/getvanitynumbers'
        );
        setIsLoading(false);
        setVanityNumberResults(data);
      } catch (err: any) {
        setIsLoading(false);
        setErrorMsg(err.message);
        console.log('err fetching vanity numbers:', err);
      }
    }
    fetchData();
  }, []);

  const switchRenderTableCell = (row: VanityNumberDTO, col: TableColumn) => {
    if (col.friendlyName === 'Vanity Number Results') {
      return Array.isArray(row[col.apiName]) ? row[col.apiName].join(', ') : '';
    } else {
      return row[col.apiName];
    }
  };
  return (
    <ComponentContainer>
      <Title>Vanity Number Generator Dashboard</Title>
      <TableContainer component={Paper}>
        {!!errorMsg && <ErrorMsg>{errorMsg}</ErrorMsg>}
        {isLoading && <MyCircularProgress />}
        {!isLoading && !errorMsg.length && (
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {columns.map((c, idx: number) => (
                  <BoldTableCell key={idx}>{c.friendlyName}</BoldTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {vanityNumberResults.map((row, rowIdx: number) => (
                <TableRow
                  key={rowIdx}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {columns.map((col, colIdx: number) => (
                    <MyTableCell key={colIdx} align="left">
                      {switchRenderTableCell(row, col)}
                    </MyTableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </ComponentContainer>
  );
}
