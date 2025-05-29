// app/admin/rechargeList/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  getRechargesByStatus,
  approveTransaction,
  rejectTransaction,
  TransactionRecord,
} from '../../../lib/adminService';

export default function RechargeListPage() {
  const [pendingList, setPendingList] = useState<TransactionRecord[]>([]);
  const [approvedList, setApprovedList] = useState<TransactionRecord[]>([]);
  const [rejectedList, setRejectedList] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchAll() {
    setLoading(true);
    try {
      const [pending, approved, rejected] = await Promise.all([
        getRechargesByStatus('pending'),
        getRechargesByStatus('approved'),
        getRechargesByStatus('rejected'),
      ]);
      setPendingList(pending);
      setApprovedList(approved);
      setRejectedList(rejected);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleApprove(id: string) {
    setLoading(true);
    try {
      await approveTransaction(id);
      await fetchAll();
    } catch (e) {
      console.error('Approve failed', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleReject(id: string) {
    setLoading(true);
    try {
      await rejectTransaction(id);
      await fetchAll();
    } catch (e) {
      console.error('Reject failed', e);
    } finally {
      setLoading(false);
    }
  }

  function renderTable(
    title: string,
    data: TransactionRecord[],
    showActions: boolean
  ) {
    return (
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        {loading && <p style={styles.loading}>加载中...</p>}
        {!loading && data.length === 0 && <p style={styles.noData}>暂无数据</p>}
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>账户ID</th>
              <th style={styles.th}>充值数量 (Pi)</th>
              <th style={styles.th}>状态</th>
              <th style={styles.th}>充值时间</th>
              {showActions && <th style={styles.th}>操作</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((req, i) => (
              <tr
                key={req.id}
                style={{
                  ...styles.tr,
                  backgroundColor: i % 2 === 0 ? '#f9f9f9' : '#fff',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = '#e6f7ff')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor =
                    i % 2 === 0 ? '#f9f9f9' : '#fff')
                }
              >
                <td style={styles.td}>{req.id}</td>
                <td style={styles.td}>{req.userId}</td>
                <td style={styles.td}>{req.amount}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.status,
                      ...(req.status === 'pending'
                        ? styles.statusPending
                        : req.status === 'approved'
                        ? styles.statusApproved
                        : styles.statusRejected),
                    }}
                  >
                    {req.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {req.createdAt
                    ? new Date(req.createdAt).toLocaleString()
                    : '-'}
                </td>
                {showActions && (
                  <td style={styles.td}>
                    <button
                      style={{ ...styles.btn, ...styles.btnApprove }}
                      onClick={() => handleApprove(req.id)}
                    >
                      通过
                    </button>
                    <button
                      style={{ ...styles.btn, ...styles.btnReject }}
                      onClick={() => handleReject(req.id)}
                    >
                      驳回
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  }

  return (
    <main style={styles.page}>
      <h1 style={styles.pageTitle}>充值审核列表</h1>
      {renderTable('待审核充值申请', pendingList, true)}
      {renderTable('充值成功记录', approvedList, false)}
      {renderTable('充值失败记录', rejectedList, false)}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily:
      "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif, 'PingFang SC', 'Microsoft YaHei'",
    padding: '2rem',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh',
    color: '#333',
  },
  pageTitle: {
    fontWeight: '700',
    fontSize: '2.5rem',
    marginBottom: '2rem',
    textAlign: 'center',
    color: '#1890ff',
    textShadow: '1px 1px 3px rgba(24,144,255,0.6)',
  },
  section: {
    marginBottom: '3rem',
    boxShadow:
      '0 8px 20px rgb(24 144 255 / 0.15), 0 2px 6px rgb(24 144 255 / 0.1)',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    marginBottom: '1rem',
    borderBottom: '2px solid #1890ff',
    paddingBottom: '0.5rem',
    color: '#096dd9',
    fontWeight: '600',
  },
  loading: {
    fontStyle: 'italic',
    color: '#999',
  },
  noData: {
    fontStyle: 'italic',
    color: '#bbb',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '1rem',
  },
  thead: {
    backgroundColor: '#e6f7ff',
  },
  th: {
    padding: '12px 15px',
    fontWeight: '600',
    color: '#096dd9',
    borderBottom: '2px solid #bae7ff',
    textAlign: 'left',
  },
  tr: {
    transition: 'background-color 0.3s ease',
    cursor: 'default',
  },
  td: {
    padding: '12px 15px',
    borderBottom: '1px solid #f0f0f0',
    color: '#333',
  },
  status: {
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: 12,
    textTransform: 'capitalize',
    display: 'inline-block',
  },
  statusPending: {
    backgroundColor: '#fffbe6',
    color: '#d48806',
  },
  statusApproved: {
    backgroundColor: '#f6ffed',
    color: '#389e0d',
  },
  statusRejected: {
    backgroundColor: '#fff1f0',
    color: '#cf1322',
  },
  btn: {
    cursor: 'pointer',
    border: 'none',
    borderRadius: 6,
    fontWeight: 600,
    padding: '8px 16px',
    marginRight: 12,
    boxShadow:
      '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    transition: 'all 0.25s ease',
    userSelect: 'none',
    fontSize: '1rem',
  },
  btnApprove: {
    backgroundColor: '#52c41a',
    color: '#fff',
  },
  btnReject: {
    backgroundColor: '#f5222d',
    color: '#fff',
  },
};
