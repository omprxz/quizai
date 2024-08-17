import Link from 'next/link';

export function TdQuiz({ name, score, result, timeTaken, submitted, id, passing_score }) {
  const resultClassName = result === 'Passed' 
    ? 'text-success' 
    : 'text-error';

  return (
    <tr>
      <td className="whitespace-nowrap border">{name}</td>
      <td className={`whitespace-nowrap border ${resultClassName}`}>{result}</td>
      <td className={`whitespace-nowrap border ${resultClassName}`}>{score.toFixed(2)}%</td>
      <td className="whitespace-nowrap border">{isNaN(passing_score) ? passing_score : passing_score.toFixed(2) + '%'}</td>
      <td className="whitespace-nowrap border">{timeTaken}</td>
      <td className="whitespace-nowrap border">{submitted}</td>
      <td className="whitespace-nowrap border text-blue-700 dark:text-blue-500">
        <Link href={`/dashboard/quiz/response/${id}`}>Click Here</Link>
      </td>
    </tr>
  );
}

export function TdUser({ title, score, result, timeTaken, submitted, id, passing_score, quizid }) {
  const resultClassName = result === 'Passed' 
    ? 'text-success' 
    : 'text-error';

  return (
    <tr>
      <td className="whitespace-nowrap border max-w-[18rem] text-ellipsis overflow-hidden"><Link href={`/dashboard/quiz/${quizid}/view`}>{title}</Link></td>
      <td className={`whitespace-nowrap border ${resultClassName}`}>{result}</td>
      <td className={`whitespace-nowrap border ${resultClassName}`}>{score.toFixed(2)}%</td>
      <td className="whitespace-nowrap border">{isNaN(passing_score) ? passing_score : passing_score.toFixed(2) + '%'}</td>
      <td className="whitespace-nowrap border">{timeTaken}</td>
      <td className="whitespace-nowrap border">{submitted}</td>
      <td className="whitespace-nowrap border text-blue-700 dark:text-blue-500">
        <Link href={`/dashboard/quiz/response/${id}`}>Click Here</Link>
      </td>
    </tr>
  );
}