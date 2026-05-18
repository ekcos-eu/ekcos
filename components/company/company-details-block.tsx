import { companyDetails } from '@/lib/company-details'

type CompanyDetailsLabels = {
  title: string
  registryCode: string
  vatIdCz: string
}

type CompanyDetailsBlockProps = {
  labels: CompanyDetailsLabels
  className?: string
}

export function CompanyDetailsBlock({
  labels,
  className
}: CompanyDetailsBlockProps) {
  return (
    <div className={className}>
      <h3 className='text-sm font-semibold tracking-wide text-[#575756] uppercase'>
        {labels.title}
      </h3>
      <div className='mt-3 space-y-4 text-sm text-[#575756]/88'>
        <div className='space-y-1'>
          <p className='font-medium text-[#575756]'>{companyDetails.name}</p>
          {companyDetails.addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <dl className='space-y-2'>
          <div>
            <dt className='font-medium text-[#575756]'>
              {labels.registryCode}
            </dt>
            <dd>{companyDetails.registryCode}</dd>
          </div>
          <div>
            <dt className='font-medium text-[#575756]'>{labels.vatIdCz}</dt>
            <dd>{companyDetails.vatIdCz}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
