import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-indigo-400 text-foreground focus:border-indigo-700'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground focus:border-border focus:text-foreground') +
                className
            }
        >
            {children}
        </Link>
    );
}
