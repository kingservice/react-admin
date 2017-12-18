import React, { Children, Component, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import compose from 'recompose/compose';
import getContext from 'recompose/getContext';

import Loading from './mui/layout/Loading';
import NotFound from './mui/layout/NotFound';
import WithPermissions from './auth/WithPermissions';
import { AUTH_GET_PERMISSIONS } from './auth/types';
import { isLoggedIn } from './reducer';

const initialPermissions = '@@ar/initialPermissions';

export class AdminRoutes extends Component {
    // Can't use null or undefined here as authClient may return any those values
    state = { childrenToRender: [], permissions: initialPermissions };

    componentWillMount() {
        if (typeof this.props.children === 'function') {
            this.getPermissions();
        } else {
            this.setState({ childrenToRender: this.props.children });
        }
    }

    getPermissions = async () => {
        const { authClient } = this.props;
        try {
            const permissions = await authClient(AUTH_GET_PERMISSIONS);
            this.setState({ permissions });
        } catch (error) {
            this.setState({ permissions: initialPermissions });
        }
    };

    componentWillUpdate(nextProps, nextState) {
        if (
            !nextProps.isLoggedIn &&
            nextProps.isLoggedIn !== this.props.isLoggedIn
        ) {
            this.setState({ permissions: initialPermissions }, () =>
                this.getPermissions()
            );
        }

        if (
            typeof nextProps.children === 'function' &&
            nextState.permissions !== this.state.permissions
        ) {
            const { children } = nextProps;

            const childrenFuncResult = children(nextState.permissions);
            if (childrenFuncResult.then) {
                childrenFuncResult.then(resolvedChildren => {
                    this.setState({
                        childrenToRender: resolvedChildren.filter(
                            child => child
                        ),
                    });
                });
                return;
            }

            return this.setState({
                childrenToRender: childrenFuncResult.filter(child => child),
            });
        }
    }

    render() {
        const { customRoutes, dashboard, catchAll, title } = this.props;

        const { childrenToRender } = this.state;

        if (!childrenToRender || childrenToRender.length === 0) {
            return (
                <Route
                    path="/"
                    key="loading"
                    render={() => (
                        <Loading
                            loadingPrimary="ra.page.loading"
                            loadingSecondary="ra.message.loading"
                        />
                    )}
                />
            );
        }

        return (
            <div>
                {Children.map(childrenToRender, child =>
                    cloneElement(child, {
                        context: 'registration',
                    })
                )}
                <Switch>
                    {customRoutes &&
                        customRoutes.map((route, index) => (
                            <Route
                                key={index}
                                exact={route.props.exact}
                                path={route.props.path}
                                component={route.props.component}
                                render={route.props.render}
                                children={route.props.children} // eslint-disable-line react/no-children-prop
                            />
                        ))}
                    {Children.map(childrenToRender, child => (
                        <Route
                            path={`/${child.props.name}`}
                            render={props =>
                                cloneElement(child, {
                                    context: 'route',
                                    ...props,
                                })}
                        />
                    ))}
                    {dashboard ? (
                        <Route
                            exact
                            path="/"
                            render={routeProps => (
                                <WithPermissions
                                    authParams={{ route: 'dashboard' }}
                                    {...routeProps}
                                    render={props =>
                                        React.createElement(dashboard, props)}
                                />
                            )}
                        />
                    ) : (
                        childrenToRender[0] && (
                            <Route
                                exact
                                path="/"
                                render={() => (
                                    <Redirect
                                        to={`/${childrenToRender[0].props
                                            .name}`}
                                    />
                                )}
                            />
                        )
                    )}
                    <Route
                        render={() =>
                            React.createElement(catchAll || NotFound, {
                                title,
                            })}
                    />
                </Switch>
            </div>
        );
    }
}

const componentPropType = PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
]);

AdminRoutes.propTypes = {
    authClient: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    catchAll: componentPropType,
    customRoutes: PropTypes.array,
    isLoggedIn: PropTypes.bool,
    title: PropTypes.string,
    dashboard: componentPropType,
};

const mapStateToProps = state => ({
    isLoggedIn: isLoggedIn(state),
});

export default compose(
    getContext({
        authClient: PropTypes.func,
    }),
    connect(mapStateToProps, {})
)(AdminRoutes);
