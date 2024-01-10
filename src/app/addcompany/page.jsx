import CustomTable from '@/components/CustomTable'
import { addCompany, langs } from '@/lib/data'
import { companyColumn } from '@/lib/table'
import React from 'react'

const Addcompany = () => {
  return (
    <div>
    <CustomTable   columns={companyColumn}
               langs={langs}
               initial_dt={addCompany}
               perPage={10}
               pagination={true}
               paginationType="page"
               defaultLang="Us"/>  
               
</div>
  )
}

export default Addcompany